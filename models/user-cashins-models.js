const mongoose = require('mongoose')


const UserCashins = mongoose.model("UserCashins",
    new mongoose.Schema({
        amount:String,
        date: String,
        type: String,
        status: String
    })
)

module.exports = UserCashins