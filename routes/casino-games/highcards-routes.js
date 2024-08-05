const express = require('express')

const router = express.Router()
const {placeBet} = require('../../controllers/casino-games/highcards-game-controllers')


router.post('/place-bet',placeBet)


module.exports = router