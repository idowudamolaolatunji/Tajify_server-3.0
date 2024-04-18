
const verifyPayment = async(reference) => {
    try {
        const headers = {
            'Authorization': 'Bearer ' + process.env.PAYSTACK_SECRET_KEY,
        };
       
        const check = await fetch(`https://api.paystack.co/transaction/verify/${reference}`,
            { method: 'GET', headers }
        );
        const response = await check.json();

        if (response.data.status !== "success") {
            res.status(400).json({
                message: "Unable to Verify Payment"
            });
        }
        return response;
    } catch(err) {
        return err;
    }
}

module.exports = verifyPayment;