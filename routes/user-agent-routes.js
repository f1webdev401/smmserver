const express = require('express')

const router = express.Router()
const {registerAgentUser} = require('../controllers/user-agent-controllers')


router.post('/register-user-agent',registerAgentUser)


module.exports = router

