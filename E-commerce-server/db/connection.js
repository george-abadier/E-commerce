const mongoose = require('mongoose')
try {
    mongoose.connect(process.env.connectionURL)
} catch (e) {
    console.log(e)
}