const mongoose = require('mongoose')
const cardSchema = mongoose.Schema({
    for:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'carts'
    },
    number: {
        type: String,
        trim: true,
        match:/^[0-9]*$/,
        minlength:16,
        maxlegth:16,
        required: true,

    },
    exp_year: {
        type: Number,
        validate(value) {
            if (value<new Date().getFullYear()) {
                throw new Error('your card expire year is invalid')
            }
        },
        required: true,
    },
    exp_month: {
        type: Number,
        validate(value) {
            if (this.exp_year==new Date().getFullYear()&&value<new Date().getMonth()) {
                throw new Error('your card expire month is invalid')
            }
        },
        required: true,
    },
    cvc: {
        type:String,
        match:/^[0-9]*$/,
        trim: true,
        minlength:3,
        maxlegth:4,
        required: true,
    },
    date: {
        type: Date,
        default: new Date(),
        expires: 600
    },
})
cardSchema.methods.toJSON = function () {
    const cardObject = this.toObject()
    delete cardObject.__v
    delete cardObject._id
    delete cardObject.date
    return cardObject
}

//             number:'4242424242424242',
//             exp_month:5,
//             exp_year:2023,
//             cvc:314
const cardModel = mongoose.model('cards', cardSchema)
module.exports = cardModel