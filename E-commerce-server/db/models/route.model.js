const mongoose = require('mongoose')
const routeSchema = mongoose.Schema({
    route: {
        type: String,
        trim: true,
        required: true,

    },
    method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        required: true,
        uppercase: true
    },
    routeAction: {
        type: String,
        default: ""
    }
})
const routeModel = mongoose.model('routes', routeSchema)
module.exports = routeModel