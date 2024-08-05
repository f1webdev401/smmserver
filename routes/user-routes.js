const express = require('express')

const router = express.Router()
const {registerUser,loginUser,userCashins,getUserCashin,userWithdraw,getUserWithdrawals} = require('../controllers/user-controller')
const userVerification = require('../middleware/auth-middleware')

router.post('/',userVerification)

router.post('/register',registerUser)

router.post('/login',loginUser)

router.post('/cashin',userCashins)

router.get('/get-user-cashins',getUserCashin)

router.post('/user-withdraw',userWithdraw)

router.get('/get-user-withdrawals',getUserWithdrawals)

router.get('/heavy',(req,res) => {
    console.log(`Worker ${process.pid} handling request`);
    let total = 0
    for(let i = 0; i < 50_000_000 ; i++) {
        total++
    }
    res.send("Total " + total)
})
module.exports = router