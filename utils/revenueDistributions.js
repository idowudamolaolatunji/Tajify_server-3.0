// const Revenue = require('../models/revenueModel');
// const StakeHolder = require('../models/stakeHoldersModel');
// const StakeSlots = require('../models/stakeSlotsModel');


// const revenueDistributions = async function() {
//     try {
//         // GET LIQUIDITY POOL REVENUE AND 
//         const liquidityPoolRevenue = await Revenue.findOne({ _id: "655202d5b2bfbf54dfe85b94", revenueType: "liquidity-pool" })
//         const tajifyRevenue = await Revenue.findOne({ _id: "655202c4b2bfbf54dfe85b8c", revenueType: "Tajify-revenue" });
//         const payoutRevenueWallet = await Revenue.findOne({ _id: "655202deb2bfbf54dfe85b96", revenueType: "payout-wallet" });

//         // NOW MAKE THE CALCULATIONS
//         const liquidityProfit = Number(liquidityPoolRevenue.revenueAmount);
//         const tajifyProfit = 0.25 * liquidityProfit;
//         const payoutProfits = 0.75 * liquidityProfit;
//         console.log(tajifyProfit, payoutProfits)
//         ///////////////////////////////////////////////////

//         // CLEAR THE LIQUIDITY POOL THAT MOMENT
//         Math.abs(liquidityPoolRevenue.revenueAmount -= liquidityProfit);
//         liquidityPoolRevenue.save({});
//         ///////////////////////////////////////////////////

//         // RETURN THE PROFITS INTO THE RIGHT REVENUE WALLETS
//         tajifyRevenue.revenueAmount += tajifyProfit;
//         payoutRevenueWallet.revenueAmount += payoutProfits;
//         tajifyRevenue.save({});
//         payoutRevenueWallet.save({});

//         // FINALLY, DISTRIBUTE THE PAYOUT REVENUE TO THE STAKE HOLDERS
//         const allstakeHolders = await StakeHolder.find({});
//         const allStakeSlots = await StakeSlots.find({});
//         // const totalNumOfSlotsBought = allStakeSlots.reduce((acc, curr) => acc + curr.slotAmount, 0);
//         const totalAmountToPayout = allStakeSlots.reduce((acc, curr) => acc + curr.slotAmount, 0);
        

//         const userTotalOwnedSlots = allstakeHolders.map(stakeholder => {
//             return allStakeSlots.filter(ownedSlot => ownedSlot.stakeHolder._id === stakeholder._id);
//         });
//         console.log(userTotalOwnedSlots);

//         const calculate = (Number(userTotalOwnedSlots / totalNumOfSlotsBought ) * 100);
//         console.log(calculate);

//         /* 
//         amount of slots bought / total bought slots owned by stackholders * 100

//         (USING THE PIE CHART EQUATION SOLUTION)
//         */
        
//     } catch(err) {
//         console.log(err);
//         throw new Error(err);
//     }
// }


// module.exports = revenueDistributions;