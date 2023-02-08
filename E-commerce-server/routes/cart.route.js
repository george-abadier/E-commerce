
const Cart = require('../app/controller/cart.controller')
const { auth, authToThisRoute } = require('../app/middleware')
const router = require('express').Router()
//customer dealing with cart
router.post('/addtocart', auth, Cart.addToCart)
router.post('/cartproduct', auth, Cart.updateProductNum)
router.get('/mycart', auth, Cart.getMyCart)
router.post('/cartconfirm/:id', auth, Cart.confirmCart)
router.get('/resendcartconfirm/:id', auth, Cart.resendConfirmationMail)
router.put('/returnfromcartconfirm/:id', auth, Cart.returnToChange)
router.get('/callbackcartconfirm/:token', Cart.confirmation)
//admin dealing with cart
router.get('/cartsneedtobedone', auth, authToThisRoute, Cart.getCartTask)
router.put('/goforward/:id', auth, authToThisRoute, Cart.nextStep)

module.exports = router