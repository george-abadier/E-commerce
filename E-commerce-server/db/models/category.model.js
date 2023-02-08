const mongoose = require('mongoose')
const validator = require('validator')
const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    icon: {
        type: String,
        default: 'http://localhost:3000/caticons/withouticon.webp',
        trim: true
    }
})
const categoryModel = mongoose.model('categories', categorySchema)
module.exports = categoryModel