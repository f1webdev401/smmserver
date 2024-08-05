const User = require('../models/user-models')
const UserCashins = require('../models/user-cashins-models')
const UserWithdrawals = require('../models/users-withdrawals-models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {createSecretToken} = require('../util/SecretToken')

const registerUser = async (req,res,next) => {
    /* 
    const {username,email,password} = req.body
    if(!username || !email || !password) {
        res.status(400)
        throw new Error("All fields is required")
    }
    const userAvailable = await User.findOne({email})
    if(userAvailable) {
        res.status(400)
        throw new Error('User Already registered')
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password,10)

    const user = await User.create({
        username,
        email,
        password:hashedPassword
    })
    console.log("new User id",user._id)
    console.log(hashedPassword)
    if(user) {
        res.status(201).json({id_:user.id,email:user.email,})
    }else {
        res.status(400)
        throw new Error("User data not valid")
    }
    */
    
   
   try {
        const {username,email,password} = req.body
        const existingUser = await User.findOne({email})
        if(existingUser) {
            return res.json({message: "User already exist"})
        }
        const user = await User.create({
            email,
            username,
            password,
            credits:0,
            isFirstLogin:true
        })
        const token = createSecretToken(user._id)
        res.cookie('token',token,{
            withCredentials:true,
            httpOnly:false
        })

        res.status(201).json({message:"User signed up successfully",success:true,user})
        next()
    }catch(e) {
        res.status(400).json({message:e.message,status:false})
        console.log(e)
    }
}

const loginUser = async (req,res,next) => {
    /* 
    const {email,password} = req.body

    if(!email || !password) {
        res.status(400)
        throw new Error("All fields are required")
    }
    const user = await User.findOne({email})

    //compare password
    if(user && (await bcrypt.compare(password,user.password))) {
        const accessToken = jwt.sign(
            {
                user:{

                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "1m"
            }
        )
        res.status(200).json({accessToken})
    }else {
        res.status(401)
        throw new Error("Email or Password is not valid")
    }
    */
    

    try {
        const {email,password} = req.body
        if(!email || !password) {
            return res.json({message: "All Fields are required"})
        }
        const user = await User.findOne({email})
        if(!user) {
            return res.json({message:"User not found"})
        }
        const auth = await bcrypt.compare(password,user.password)
        if(!auth) {
            return res.json({message: "Invalid email or password"})
        }
        const token = createSecretToken(user._id)
        res.cookie('token',token, {
            withCredentials: true,
            httpOnly: false,
            expires: new Date(Date.now() + 8 * 3600000) 
        })
        res.status(201).json({message:"User Logged in successfully",success:true})
        next()
    }catch(e) {
        console.log(e)
        return res.status(400).json({message:e.message,success:false})
    }
}

const userCashins = async (req,res) => {
    const {amount,user_id} = req.body
    try {
        let user_cashin = await UserCashins.create({
            amount:amount,
            date: 'asd',
            type: 'asdasd',
            status: 'success'
        })
       await User.findByIdAndUpdate(user_id,
            {$push: {cashins:user_cashin.id}},
            {new:true}
        )
        res.status(200).send({ success: true, cashin: user_cashin });
    }
    catch(e) {
        console.log(e)
        res.status(500).send({success:false,message:e.message})
    }   
}

const getUserCashin = async (req,res) => {
    const {user_id} = req.body 
    let get_user_cashin = await User.findById(user_id).populate("cashins","-_id -__v")
    res.status(200).send({sucess:true,response:get_user_cashin.cashins})
}

const userWithdraw = async (req,res) => {
    const {amount,type,number,user_id} = req.body
    try {
        let user_withdraw = await UserWithdrawals.create({
            amount:amount,
            date: "asdasd",
            number:number,
            type: "Gcash",
            status: "pending"
        })
        await User.findByIdAndUpdate(user_id,
            {$push: {withdrawals: user_withdraw.id}},
            {new:true}
        )
        res.status(200).send({ success: true, withdrawals: user_withdraw });

    }catch(e) {
        console.log(e)
        res.send(500).send({success:false , response: e.message})
    }
}

const getUserWithdrawals = async (req,res) => {
    const {user_id} = req.body 
    let get_user_withdrawals = await User.findById(user_id).populate("withdrawals","-_id -__v")
    res.status(200).send({sucess:true,response:get_user_withdrawals.withdrawals})
}
module.exports = {registerUser,loginUser,userCashins,getUserCashin,userWithdraw,getUserWithdrawals}