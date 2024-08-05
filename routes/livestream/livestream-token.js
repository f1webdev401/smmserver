const express = require('express')

const router = express.Router()

const generateToken = require('../../controllers/livestream/livestream-token-controller')


router.get('/livestream-token',generateToken)

module.exports = router