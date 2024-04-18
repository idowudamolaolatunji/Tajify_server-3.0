const User = require('../models/userModel');
const Blog = require('../models/blogModel');
// const Product = require('../models/marketModels/productModel');

const NewsLetter = require('../models/newsLetterModel');

exports.search = async (req, res) => {
    const { query } = req.query;
    console.log(query)

    try {
        const userResults = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { fullName: { $regex: query } }
            ]
        });
        const blogResults = await Blog.find({ title: { $regex: new RegExp(query, 'i') }});
        // const productResults = await Product.find({ name: { $regex: new RegExp(query, 'i') }});

        const results = {
            users: userResults,
            blogs: blogResults,
            products: productResults
        };

        res.status(200).json({
            status: 'success',
            data: {
                results
            }   
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};



exports.newsLetter = async (req, res) => {
    try {
        const { email } = req.body;
        const foundEmail = await NewsLetter.findOne({ email });
        if(foundEmail) return res.json({ message: 'Email already submitted! '});
        const submittedEmail = await NewsLetter.create({ email });

        res.status(200).json({
            status: 'success',
            message: 'Email Submitted',
            data: {
                email: submittedEmail,
            }
        })

    } catch(err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
}