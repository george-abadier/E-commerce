const mongoose = require('mongoose');
const jsonWebToken = require('jsonwebtoken')
const tokenSchema = mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        trim: true,
        refPath: 'users'
    },
    date: {
        type: Date,
        expires: 600
    }
})
tokenSchema.statics.creatToken = async function (id, lifeTime) {
    let token
    if (lifeTime) {
        token = await jsonWebToken.sign({ _id: id }, process.env.tokenPass)
    } else {
        token = await jsonWebToken.sign({ _id: id }, process.env.tokenPass, { expiresIn: '600000' })
    }
    return token
}
const tokenModel = mongoose.model('tokens', tokenSchema)
module.exports = tokenModel