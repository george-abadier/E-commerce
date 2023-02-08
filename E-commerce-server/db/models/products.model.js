const mongoose = require('mongoose')
const productSchema = mongoose.Schema({
    ourOwn: {
        type: Boolean,
        required: true,
    },
    from: {
        type: mongoose.SchemaTypes.ObjectId,
        required: function () {
            return !this.ourOwn
        },
        trim: true,
        ref: 'users'
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 1
    },
    images: {
        type: [String],
        trim: true
    },
    category: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        trim: true,
        ref: 'categories'
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    overAllRate: {
        type: Number,
        default: 1,
        min: 1,
        max: 5,
    },
    ratings: [{
        rate: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        rateComment: {
            type: String,
            required: true,
        },
        userID: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true,
            trim: true,
            ref: 'users'
        },
        helpful: {
            type: Number,
            default: 0,
        }
    }]
})
productSchema.method('updateOverALLRate' , function (rate, isNew, oldRate) {
    console.log(isNew,this.overAllRate,this.ratings.length,rate,oldRate)
    console.log((this.overAllRate * this.ratings.length + rate - oldRate) / this.ratings.length)
    if (isNew) {
        this.overAllRate = (this.overAllRate * (this.ratings.length - 1) + rate) / this.ratings.length
    } else {
        this.overAllRate = (this.overAllRate * this.ratings.length + rate - oldRate) / this.ratings.length
    }
})
const productModel = mongoose.model('products', productSchema)
module.exports = productModel