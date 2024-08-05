const mongoose = require('mongoose')

const userAgentSchema = mongoose.Schema({
    username: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    earnings: {
        type: Number
    },
    referralLink: {
        type: String
    },
    balance: {
        type: Number
    },
    players: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userSchema"
    }
})

module.exports = mongoose.model('UserAgent',userAgentSchema)