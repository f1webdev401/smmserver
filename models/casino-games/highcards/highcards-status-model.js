const mongoose = require('mongoose')

const HighCardsStatus = mongoose.Schema({
    game_name: {
        type: String,
    },  
    status: {
        type: String
    },
    is_closed: {
        type: Boolean
    },
    winner: {
        type: String
    }
})

module.exports = mongoose.model("HighCardsStatus",HighCardsStatus)