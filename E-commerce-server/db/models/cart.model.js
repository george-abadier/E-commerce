const mongoose = require('mongoose')
const validator = require('validator')
const locationSchema = mongoose.Schema({
    type: {
        type: String,
        enum: ['home', 'work'],
        required: true,
        trim: true,
        lowercase: true
    },
    address: {
        type: String,
        required: true,
        minlength: 10,
        trim: true,
    }
})
const phoneNumberSchema = mongoose.Schema({
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
})
const cartSchema = mongoose.Schema({
    location: {
        type: locationSchema,
        // required: true
    },
    userID: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        trim: true,
        ref: 'users'
    },
    phoneNumbers: {
        type: [phoneNumberSchema],
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'credit'],
        trim: true,
        lowercase: true,

    },
    status: {
        type: String,
        enum: ['not completed', 'verification mode', 'is being prepared', 'in its way', 'received'],
        default: 'not completed',
        trim: true,
        lowercase: true,
    },
    totalPrice: {
        type: Number,
        default: 0
    }
    ,
    products: [{
        product: {
            type: mongoose.SchemaTypes.ObjectId,
            trim: true,
            required: true,
            ref: 'products'
        },
        number: {
            type: Number,
            required: true,
            min: 1
        }
    }]
})
cartSchema.method('updateTotalPrice',function (){
    this .totalPrice=this.products.reduce((total,product)=>{
        return total+(product.product.price*product.number)
    },0)
})
// cartSchema.method.isCompleted = function () {
//     return this.completed
// }
const cartModel = mongoose.model('carts', cartSchema)
module.exports = cartModel