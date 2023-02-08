require('../db/connection')
require('./passport')
const cookieSession = require('cookie-session')
const passport = require('passport');
const express = require('express')
const cors = require('cors')
const path = require('path')
const app = express()
app.use(cookieSession({
    name: 'tuto-session',
    keys: ['key1', 'key2']
}))
app.use(passport.initialize());
app.use(passport.session())
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: true }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "../statics")))
app.use(express.json())
const userRoutes = require('../routes/user.route')
const roleRoutes = require('../routes/role.route')
const productRoutes = require('../routes/products.route')
const cartRoutes = require('../routes/cart.route')
app.use('/ecommerce/cart', cartRoutes)
app.use('/ecommerce/product', productRoutes)
app.use('/ecommerce/user', userRoutes)
app.use('/ecommerce/role', roleRoutes)
module.exports = app