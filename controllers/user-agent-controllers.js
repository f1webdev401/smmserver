const bcrypt = require('bcrypt')
const UserAgent = require('../models/user-agent/user-agent-models')

const registerAgentUser = async (req,res) => {
    const {username,email,password} = req.body

    try {
        if(!username || !email || !password) {
            throw new Error("All Fields are required")
        }
        const availableUserAgent = await UserAgent.findOne({username})
        if(availableUserAgent) {
            throw new Error("User is Already registered")
        }
        const hashedPassword = await bcrypt.hash(password,10)
        const userAgent = await UserAgent.create({
            username,
            email,
            password: hashedPassword,
            earnings: 0,
            balance: 0,
        })
        console.log(userAgent)
        res.status(200).send({success:true,response:userAgent})
    }catch(e) {
        console.log(e)
        res.status(500).send({error: e.message})
    }
}

module.exports = {registerAgentUser}