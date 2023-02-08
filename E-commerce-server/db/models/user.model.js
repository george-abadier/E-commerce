const mongoose = require('mongoose');
const validator = require('validator')
const bcrybt = require('bcryptjs')
const role=require('./role.model')
const userSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        maxlength: 30,
    },
    role: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'roles'
    },
    age: {
        type: Number,
        min: 21,
        required: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('invalid email address')
            }
        }
    },
    status: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: new Date(),
        expires: 600
    },
    image: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 5
    },
    gender: {
        type: String,
        required: true,
        enum: ["male", "female"],
        trim: true,
        lowercase: true
    },
    phoneNums: [{
        number: {
            type: String,
            required: true,
            validate(value) {
                if (!validator.isMobilePhone(value, "ar-EG"))
                    throw new Error("invalid number")
            }
        },
        type: {
            type: String,
            enum: ['home', 'work', 'personal'],
            trim: true,
            lowercase: true
        }
    }],
    notifications: [{
        date: {
            type: Date,
            default: new Date()
        },
        message: {
            type: String,
            trim: true,
            required: true,

        },
        seen: {
            type: Boolean,
            default: false
        },
    }],
    liked: {
        type: [mongoose.SchemaTypes.ObjectId],
        default: [],
        ref: 'products'
    },
})
userSchema.pre('save', function () {
    if (this.isModified('password')) this.password = bcrybt.hashSync(this.password)
})
userSchema.statics.logIn = async (email, enterdPassword) => {
    const userData = await user.findOne({ email })
    if (!userData) {
        throw new Error('invalid email')
    }
    if (enterdPassword) {
        if (!bcrybt.compareSync(enterdPassword, userData.password)) {
            throw new Error('invalid password')
        }
    } else {
        throw new Error('invalid password')
    }
    return userData
}
userSchema.statics.notify = async (id, message) => {
    if (id) {
        await user.findByIdAndUpdate(id, { $push: { notifications: { message } } })
    } else {
        const adminID=await role.findOne({role:'admin'})
        console.log(adminID)
       const b= await user.updateMany({role:adminID._id},{ $push: { notifications: { message } } })
       console.log(b)
    }
}
userSchema.virtual('myProducts', {
    ref: 'products',
    localField: "_id",
    foreignField: "from"
})
userSchema.methods.toJSON = function () {
    const userObject = this.toObject()
    delete userObject.__v
    delete userObject.password
    return userObject
}
const user = mongoose.model('users', userSchema)
module.exports = user