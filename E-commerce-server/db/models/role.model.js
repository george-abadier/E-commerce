const mongoose = require('mongoose')
const roleSchema = mongoose.Schema({
    role: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    routes: {
        type: [mongoose.SchemaTypes.ObjectId],
        trim: true,
        default: [],
        ref: 'routes'
    }

}, {
    timestramp: true
})
const roleModel = mongoose.model('roles', roleSchema)
module.exports = roleModel