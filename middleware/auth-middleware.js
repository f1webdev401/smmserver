require('dotenv').config()
const User = require('../models/user-models')
const jwt = require('jsonwebtoken')

const userVerification = async (req,res) => {
    const token = req.cookies.token
    if(!token) {
        return res.json({status:false})
    }
    jwt.verify(token,process.env.TOKEN_KEY,async(err,data) => {
        if(err) {
            return res.json({status:false})
        }else {
            const user = await User.findById(data.id,'-cashins -withdrawals')
            if(user) {
                return res.json({status:true,user:user})
            }
            else {
                return res.json({status:false})
            }
        }
    })
}

module.exports = userVerification