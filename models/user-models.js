const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const userSchema = mongoose.Schema({
    username: {
        type:String,
        require: [true, "Please add username"]
    },
    email: {
        type: String,
        required: [true,"Please add email"],
        unique: [true,"Email is already taken"]
    },
    password: {
        type: String,
        require: [true,"Please add password"]
    },
    credits: {
        type: Number,
        require: [false]
    },
    luckyPoints: {
        type: Number,
        require: [false]
    },  
    isFirstLogin: {
        type: Boolean,
        require: [false]
    },
    ownRefferal: {
        type: String,
        require: [false]
    },
    cashins: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserCashins"
        }
    ],
    withdrawals: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "UserWithdrawals"
        }
    ]
},
    {
        Timestamps: true
    }
)

userSchema.pre("save", async function(next)  {
    const user = this
    if(!user.isModified('password')) return next()

    user.password = await bcrypt.hash(user.password ,10)
    next()
})

module.exports  = mongoose.model('User',userSchema)