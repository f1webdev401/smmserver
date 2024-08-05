const mongoose = require('mongoose')

const UserWithdrawals = mongoose.model("UserWithdrawals",
    new  mongoose.Schema({
        amount:String,
        date: String,
        number:String,
        type: String,
        status: String
    })
)

module.exports = UserWithdrawals