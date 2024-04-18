const Product = require("../models/marketModels/productModel");
const User = require("../models/userModel");
const Blog = require("../models/blogModel");
const Transaction = require("../models/transactionModel");


// CHECKOUT SINGLE PRODUCTS
exports.singleCheckoutPayment = async(req, res) => {
    try {
        const buyer = await User.findById(req.user._id)
        if(!buyer || !buyer.isActive) return res.json({ message: 'Cannot find buyer!' });
        
        const product = await Product.findById(req.params.productId);
        if(buyer.productBought.includes(product._id)) {
            return res.json({ message: 'You already bought this item! '});
        }

        if(!product) return res.json({ message: 'Product not found or removed by seller' });

        const { amount, type } = req.body;
        const seller = await User.findById(product.creator);
        if(!seller || !seller.isActive ) return res.json({ message: 'Cannot find seller!' });

        if(type === 'naira') {
            if(buyer.nairaWalletBalance >= amount) {
                buyer.nairaWalletBalance -= amount;
                seller.nairaWalletBalance += amount;
                buyer.productBought.push(product._id);
                await buyer.save({ validateBeforeSave: false });
                await seller.save({ validateBeforeSave: false });

            } else {
                return res.json({ message: 'Insufficient Naira Balance!' })
            }
        } 
        
        if(type === 'taji') {
            if(buyer.tajiWalletBalance >= amount) {
                buyer.tajiWalletBalance -= amount;
                seller.tajiWalletBalance += amount;
                buyer.productBought.push(product._id);
                await buyer.save({ validateBeforeSave: false });
                await seller.save({ validateBeforeSave: false });

            } else {
                return res.json({ message: 'Insufficient TAJI Balance!' })
            }
        } 
        
        if(type === 'usdt') {
            if(buyer.usdtWalletBalance >= amount) {
                buyer.usdtWalletBalance -= amount;
                seller.usdtWalletBalance += amount;
                buyer.productBought.push(product._id);
                await buyer.save({ validateBeforeSave: false });
                await seller.save({ validateBeforeSave: false });

            } else {
                return res.json({ message: 'Insufficient USDT Balance!' })
            }
        }

        const buyerTransaction = await Transaction.create({
            user: buyer._id,
            amount: amount,
            reference: Date.now(),
            currency: type,
            status: 'success',
            type: 'purchase',
            charged: true,
        });

        const sellerTransaction = await Transaction.create({
            user: seller._id,
            amount: amount,
            reference: Date.now(),
            currency: type,
            status: 'success',
            type: 'sales',
            charged: true,
        });

        res.status(200).json({
            status: 'success',
            message: 'Transaction Successful',
            data: {
                buyer, seller, buyerTransaction, sellerTransaction
            }
        });
        
    } catch(err) {
        return res.status(200).json({
            status: 'fail',
            message: err.message || 'Something went wrong!'
        })
    }
}



// BUY BLOG POST
exports.blogPayment = async(req, res) => {
    try {
        const { amount, type } = req.body;
        const blog = await Blog.findById(req.params.blogId);
        if(!blog) return res.json({ message: 'Blog not found or removed by creator' });
        const creator = await User.findById(blog.creator);
        const buyer = await User.findById(req.user._id);
        
        if(buyer.blogPostBought.includes(blog._id)) {
            return res.json({ message: 'You already bought this item! '});
        }

        if(!creator || !creator.isActive ) return res.json({ message: 'Cannot find creator!' });
        if(!buyer || !buyer.isActive) return res.json({ message: 'Cannot find buyer!' });


        if(type === 'naira') {
            if(buyer.nairaWalletBalance >= amount) {
                buyer.nairaWalletBalance -= amount;
                creator.nairaWalletBalance += amount;
                buyer.blogPostBought.push(blog._id);
                await buyer.save({ validateBeforeSave: false });
                await creator.save({ validateBeforeSave: false });

            } else {
                return res.json({ message: 'Insufficient Naira Balance!' })
            }
        } 
        
        if(type === 'taji') {
            if(buyer.tajiWalletBalance >= amount) {
                buyer.tajiWalletBalance -= amount;
                creator.tajiWalletBalance += amount;
                buyer.blogPostBought.push(blog._id);
                await buyer.save({ validateBeforeSave: false });
                await creator.save({ validateBeforeSave: false });

            } else {
                return res.json({ message: 'Insufficient TAJI Balance!' })
            }
        } 
        
        if(type === 'usdt') {
            if(buyer.usdtWalletBalance >= amount) {
                buyer.usdtWalletBalance -= amount;
                creator.usdtWalletBalance += amount;
                buyer.blogPostBought.push(blog._id);
                await buyer.save({ validateBeforeSave: false });
                await creator.save({ validateBeforeSave: false });

            } else {
                return res.json({ message: 'Insufficient USDT Balance!' })
            }
        }

        const buyerTransaction = await Transaction.create({
            user: buyer._id,
            amount: amount,
            reference: Date.now(),
            currency: type,
            status: 'success',
            type: 'purchase',
            charged: true,
        });

        const creatorTransaction = await Transaction.create({
            user: creator._id,
            amount: amount,
            reference: Date.now(),
            currency: type,
            status: 'success',
            type: 'sales',
            charged: true,
        });

        res.status(200).json({
            status: 'success',
            message: 'Transaction Successful',
            data: {
                buyer, creator, buyerTransaction, creatorTransaction
            }
        });
        
    } catch(err) {
        return res.status(200).json({
            status: 'fail',
            message: err.message || 'Something went wrong!'
        })
    }
}


// ALL PRODUCTY BOUGHT BY USER
exports.getAllBoughtProducts = async(req, res) => {
    try {
        const currUser = await User.findById(req.user._id);
        if(!currUser || !currUser.isActive) return res.json({ message: 'Cannot find user' });

        const boughtProducts = await Product.find({ _id: { $in: currUser.productBought } });
        if(!boughtProducts) return res.json({ message: 'No bought products' });

        res.status(200).json({
            status: 'success',
            count: boughtProducts.length,
            data: {
                user: currUser,
                boughtProducts
            }
        })

    } catch(err) {
        return res.status(200).json({
            status: 'fail',
            message: err.message || 'Something went wrong!'
        })
    }
}



// ALL BLOGS BOUGHT 
exports.getAllBoughtBlogs = async(req, res) => {
    try {
        const currUser = await User.findById(req.user._id);
        if(!currUser || !currUser.isActive) return res.json({ message: 'Cannot find user' });

        const boughtBlogs = await Blog.find({ _id: { $in: currUser.blogPostBought } });
        if(!boughtBlogs) return res.json({ message: 'No bought blogs' });

        res.status(200).json({
            status: 'success',
            count: boughtBlogs.length,
            data: {
                user: currUser,
                boughtBlogs
            }
        })

    } catch(err) {
        return res.status(200).json({
            status: 'fail',
            message: err.message || 'Something went wrong!'
        })
    }
}



// exports.multipleCheckoutPayment = async (req, res) => {
//     try {
//         const {productIds, amount, type } = req.body;
//         const products = await Product.find({ _id: { $in: productIds } });

//         if (!products || products.length === 0) {
//             return res.json({ message: 'No product to purchase' });
//         }

//         const buyer = await User.findById(req.user._id)
//         // const creatorIds = [...new Set(products.map(product => product.creator))];
//         // const sellers = await User.find({ _id: { $in: sellerIds } });

//         for (const product of products) {
//             const seller = await User.findById(product.creator);
          
//             if (type === 'naira' && amount === product.price && buyer.nairaWalletBalance >= amount) {
//                 buyer.nairaWalletBalance -= amount;
//                 seller.nairaWalletBalance += amount;
//                 await buyer.save({ validateBeforeSave: false });
//                 await seller.save({ validateBeforeSave: false });
//                 return;
//             }
            
//             if (type === 'taji' && buyer.tajiWalletBalance >= amount) {
//                 buyer.tajiWalletBalance -= amount;
//                 seller.tajiWalletBalance += amount;
//                 await buyer.save({ validateBeforeSave: false });
//                 await seller.save({ validateBeforeSave: false });
//                 return;
//             }
            
//             if (type === 'usdt' && buyer.usdtWalletBalance >= amount) {
//                 buyer.usdtWalletBalance -= amount;
//                 seller.usdtWalletBalance += amount;
//                 await buyer.save({ validateBeforeSave: false });
//                 await seller.save({ validateBeforeSave: false });
//                 return 
//             }
//         }

//     }catch(err) {
//         return res.status(200).json({
//             status: 'fail',
//             message: err.message || 'Something went wrong!'
//         })
//     }
// }