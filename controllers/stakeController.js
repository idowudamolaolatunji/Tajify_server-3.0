const StakeHolder = require("../models/stakeHoldersModel");
const StakeSlots = require("../models/stakeSlotsModel");
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');
const Revenue = require('../models/revenueModel');
const Wallet = require("../models/walletModel");


// CREATE A STAKEHOLDER AND STAKING DOCUMENT FOR A USER
exports.createStaking = async (req, res) => {
	try {
        const { stakeHolderUsername, slotAmount } = req.body;
        console.log(stakeHolderUsername, slotAmount)
        // FIND USER BASED ON THE CURRENT REQUESTING USER
        const user = await User.findById(req.user._id);
        if(user.username !== stakeHolderUsername) return res.status(404).json({message: 'Username not found!'});
        const userWallet = await Wallet.findOne({ user: user._id });

        // GET THE LIQUIDITY POOL WALLET
        const liquidityPool = await Revenue.findOne({ _id: "655202d5b2bfbf54dfe85b94", revenueType: "liquidity-pool" });

        // CHECK IF USER HAS ENOUGH TAJI BALANCE TO BUY A SLOT
        const amountPerSlots = 20000;
        const numberOfSlots = Number(slotAmount);
        const stakingTajiAmount = amountPerSlots * numberOfSlots;
        const transactionFee = stakingTajiAmount * 0.005;
        const totalStakingAmount = stakingTajiAmount + transactionFee;


        if(userWallet.tajiWalletBalance < stakingTajiAmount) {
            return res.status(400).json({ message: 'Insufficient Taji balance'});
        }
        
        // CHECK IF USER IS ALREADY A STAKEHOLDER
        const alreayAStakeHolder = await StakeHolder.findOne({ stakeHolderUsername });

        if(alreayAStakeHolder) {
            // FIND THE STAKEHOLDER AND UPDATE HIS SLOT AMOUNT
            const currentUserStakeSlots = await StakeSlots.findOneAndUpdate(
                { stakeHolder: alreayAStakeHolder._id },
                { $inc: { slotAmount: numberOfSlots } },
                { new: true }
            );

            alreayAStakeHolder.slots = numberOfSlots;
            await alreayAStakeHolder.save({});

            // UPDATE THE USER WALLET AND STAKING SLOTS
            userWallet.tajiWalletBalance -= totalStakingAmount;
            await userWallet.save();

            // UPDATE THE LIQUIDITY POOL
            liquidityPool.revenueAmount += stakingTajiAmount;
            await liquidityPool.save({});

            // CREATE A STAKING TRANSACTION DOCUMENT
            const newTransaction = await Transaction.create({
                user: user._id,
                amount: totalStakingAmount,
                reference: Date.now(),
                currency: 'others',
                status: 'success',
                type: 'staking',
                slots: numberOfSlots,
                charged: true,
            });

            return res.status(200).json({ 
                status: 'success',
                data: {
                    transaction: newTransaction,
                    stakeSlots: currentUserStakeSlots
                },
                message: `${numberOfSlots} slot${numberOfSlots > 1 ? 's' : ''} was just purchased!`
            });
        } 

        // CREATE A STAKEHOLDER DOCUMENT FOR EACH NEW USER THAT WANTS TO STAKE
        const stakeHolder = await StakeHolder.create({
            stakeHolderUsername: req.body.stakeHolderUsername,
            isActive: true,
        });

        // UPDATE HIS STAKES
        stakeHolder.slots = numberOfSlots;
        await stakeHolder.save({})

        // UPDATE THE USER WALLET
        userWallet.tajiWalletBalance -= totalStakingAmount;
        await userWallet.save();

        // UPDATE THE LIQUIDITY POOL
        liquidityPool.revenueAmount += stakingTajiAmount;
        await liquidityPool.save({});

        // STAKING IMPLEMENTED FOR THE USER
        const stake = await StakeSlots.create({
            stakeHolder: stakeHolder._id,
            slotAmount: numberOfSlots,
            isActive: true,
        });

        // CREATE A STAKING TRANSACTION DOCUMENT
        const newTransaction = await Transaction.create({
            user: user._id,
            amount: totalStakingAmount,
            reference: Date.now(),
            currency: 'others',
            status: 'success',
            type: 'staking',
            slots: numberOfSlots,
            charged: true,
        });

        res.status(200).json({
            status: 'success',
            message: 'You Just made a successful stake!',
            data: {
                stakeHolder,
                stake,
                transaction: newTransaction
            }
        });
	} catch (err) {
		console.log(err);
		return res.status(400).json({
			status: "fail",
			message: err.message || "Something went wrong!",
		});
	}
};


// GET A STAKEHOLDER (DOCUMENT)
exports.getStakeHolder = async (req, res) => {
    try {
        const stakeHolders = await StakeHolder.findById(req.params.stakeHolderId);
        res.status(200).json({
            status: 'success',
            count: stakeHolders.length,
            data: {
                stakeHolders
            }
        })
    } catch(err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wront!'
        })
    }
}


// GET ALL STAKEHOLDERS (DOCUMENTS)
exports.getAllStakeHolders = async (req, res) => {
    try {
        const stakeHolders = await StakeHolder.find();
        res.status(200).json({
            status: 'success',
            count: stakeHolders.length,
            data: {
                stakeHolders
            }
        })
    } catch(err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wront!'
        })
    }
}


// GET ALL STAKEHOLDERS (DOCUMENTS)
exports.getAllStaking = async (req, res) => {
    try {
        const stakings = await StakeSlots.find();
        res.status(200).json({
            status: 'success',
            count: stakings.length,
            data: {
                stakings
            }
        })
    } catch(err) {
        console.log(err);
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Something went wront!'
        })
    }
}


// exports.getMyStakings = async (req, res) => {
//     try {
//         const currentUser = await User.findById(req.user._id);
//         const stakeHolderDoc = await StakeHolder.findOne({ stakeHolderUsername: currentUser.username });
//         console.log(currentUser, stakeHolderDoc)
//         const stakings = await StakeSlots.findOne({ stakeHolder: stakeHolderDoc._id });

//         res.status(200).json({
//             status: 'success',
//             data: {
//                 stakings,
//             }
//         })

//     } catch(err) {
//         return res.status(400).json({
//             status: 'fail',
//             message: err.message || 'Something went wrong!'
//         })
//     }
// }



/*
// Route to distribute revenue
app.post('/distribute-revenue', async (req, res) => {
    try {
      const totalRevenue = req.body.amount; // Total revenue in sub-revenue wallet
  
      // Distribute 75% to main-revenue wallet
      const mainRevenue = totalRevenue * 0.75;
  
      // Distribute 25% as rewards to stakeholders
      const stakeholders = await User.find({ stake: { $gt: 0 } });
      const totalStake = stakeholders.reduce((acc, user) => acc + user.stake, 0);
      
      for (const user of stakeholders) {
        const reward = (user.stake / totalStake) * (totalRevenue * 0.25);
        user.reward += reward;
        await user.save();
      }
  
      // Move funds to main-revenue wallet and update total revenue
      // (You'll need to implement this part based on your system)
      
      res.status(200).json({ message: 'Revenue distribution successful' });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred' });
    }
});
*/

