const mongoose = require('mongoose')

const HighCardsBetSchema = mongoose.Schema({
    amount: {
        type: Number,
        require: [true]
    },
    choosen_card: {
        type: String,
        require: [true]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

module.exports = mongoose.model("HighCardsBetCollection",HighCardsBetSchema)