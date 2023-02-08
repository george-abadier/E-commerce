const Helper = require("../helper");
const cartModel = require('../../db/models/cart.model');
const tokenModel = require('../../db/models/tokens.model')
const {sendmail} = require("../mail");
const jsonWebToken = require("jsonwebtoken");
const productModel = require("../../db/models/products.model");
const user = require("../../db/models/user.model");
class Cart {
    static addToCart = (req, res) => {
        Helper.handlingMyFunction(req, res, async (req) => {
            await Helper.isThisIdExistInThisModel(req.body.product, productModel, 'product')
            let myCart = await cartModel.findOne({ userID: req.user._id, status: { $in: ['not completed', "verification mode"] } }).populate('products.product')
            if (myCart) {
                if (myCart.status == "verification mode") {
                    throw new Error('please set the situation of your last cart')
                }
                const productExist = myCart.products.findIndex(p => { return req.body.product == p.product._id })
                if (productExist == -1) {
                    myCart.products.push(req.body)
                    myCart.updateTotalPrice()
                    myCart.totalPrice += (req.body.number * req.body.price)
                } else {
                    myCart.products[productExist].number += parseInt(req.body.number)
                    myCart.updateTotalPrice()
                }
            } else {
                myCart = await cartModel({ userID: req.user._id, email: req.user.email, totalPrice: (req.body.number * req.body.price) })
                myCart.products.push(req.body)
            }
            return myCart.save()
        }, 'added to your cart')
    }
    static updateProductNum = async (req, res) => {
        try {
            const myCart = await cartModel.findOne({ userID: req.user._id, status: { $in: ['not completed', "verification mode"] } }).populate('products.product')
            if (myCart == null) {
                res.redirect('/lavie/addtocart')
            } else {
                if (myCart.status == "verification mode") {
                    throw new Error('please set the situation of your last cart')
                }
                const i = myCart.products.findIndex(p => { return req.body.product == p.product._id })
                if (i == -1) {
                    throw new Error('you don`t have this product in your cart')
                }
                const prevNum = myCart.products[i].number
                myCart.products[i].number += parseInt(req.body.number)
                if (myCart.products[i].number <= 0) {
                    myCart.products.splice(i, 1)
                }
                myCart.updateTotalPrice()
                const result = await myCart.save()
                Helper.formatMyAPIRes(res, 200, true, result, 'your cart  updated')
            }
        } catch (e) {
            console.log(e)
            if (e.name == 'Error') {
                Helper.formatMyAPIRes(res, 200, false, e, e.message)
            } else {
                Helper.formatMyAPIRes(res, 500, false, e, e.message)
            }
        }
    }
    static getMyCart = (req, res) => {
        Helper.handlingMyFunction(req, res, async (req) => {
            const myCart = await cartModel.findOne({ userID: req.user._id, status: { $in: ['not completed', "verification mode"] } }).populate('products.product')
            myCart.updateTotalPrice()
            await myCart.save()
            if (true) {
                return myCart
            }
        }, "here is your cart please note if it on verification mode")
    }
    static confirmCart = async (req, res) => {
        try {
            const fullNameReg = /^[a-zA-z]{3,}\s{1}[a-zA-Z]{3,}$/
            const myCart = await Helper.isThisIdExistInThisModel(req.params.id, cartModel, 'cart', 'products.product','userID')
            // console.log(myCart)
            if (myCart.status != 'not completed') {
                throw new Error('this cart had a step forward this action for the uncompleted carts')
            }
            if (!fullNameReg.test(req.body.fullname)) {
                throw new Error('please enter your full name right')
            }
            myCart.fullname = req.body.fullname
            if (!req.body.location) {
                throw new Error('please enter location to deliver to')
            }
            myCart.location = req.body.location
            if (req.body.phoneNumbers.length < 2) {
                throw new Error('please enter 2 contacts at least')
            }
            myCart.phoneNumbers = req.body.phoneNumbers
            if (!req.body.paymentMethod) {
                throw new Error('please enter your the suitable payment method to you')
            }
            myCart.paymentMethod = req.body.paymentMethod
            let totalPrice = 0
            myCart.products.forEach(p => {
                totalPrice += (p.product.price * p.number)
            })
            myCart.totalPrice = totalPrice
            myCart.status = 'verification mode'
            await myCart.save()
            const confirmation = await tokenModel.creatToken(myCart._id, 0)
            sendmail(myCart.userID.email,"Please confirm your cart",
            `<h1>Email Confirmation</h1>
            <h2>Hello ${myCart.userID.userName}</h2>
            <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
            <a href=http://localhost:3000/ecommerce/cart/callbackcartconfirm/${confirmation}> Click here</a>
            </div>`)
            Helper.formatMyAPIRes(res, 200, true, {}, 'please check your mail quickly you have 10 mins then you will need to send another confirmation mail')
        } catch (e) {
            console.log(e)
            if (e.name == 'Error') {
                Helper.formatMyAPIRes(res, 200, false, e, e.message)
            } else if (e.name == 'MongoServerError' || e.name == 'ValidationError' || e.name == 'CastError') {
                Helper.formatMyAPIRes(res, 400, false, e, e.message)
            } else {
                Helper.formatMyAPIRes(res, 500, false, e, e.message)
            }

        }
    }
    static confirmation = async (req, res) => {
        try {
            const decToken = await jsonWebToken.verify(req.params.token, process.env.tokenPass)
            const myCart = await cartModel.findById(decToken._id).populate('products.product')
            if (myCart.status == 'not completed') {
                throw new Error('you had made some changes in your cart you need to confirm it again ')
            }
            if (myCart.status != "verification mode") {
                throw new Error('we had go forward with your cart after this action your cart ' + myCart.status)
            }
            myCart.status = 'is being prepared'
            console.log(myCart.products)
            myCart.products.forEach(async(pro)=>{
                console.log('a')
                await user.notify(pro.product.from,`the an order contain ${pro.product.name} that you sell,the quantity needed is ${pro.number},please prepare this quantity in next couble of hours`)
            })
            console.log('c')
            const result = await myCart.save()
            Helper.formatMyAPIRes(res, 200, true, result, 'your cart ' + myCart.status + ' we will inform you with any update')
            // if(!tokenExist){
            //     throw new Error('this confirmation mail is no longer valid if you did`t confirm your mail yet please resend an new valid confirmation mail ')
            // }
        }
        catch (e) {
            if (e.name == 'Error') {
                Helper.formatMyAPIRes(res, 200, false, e, e.message)
            }else if (e.name == 'MongoServerError' || e.name == 'ValidationError' || e.name == 'CastError') {
                Helper.formatMyAPIRes(res, 400, false, e, e.message)
            } else {
                Helper.formatMyAPIRes(res, 500, false, e, e.message)
            }
        }
    }
    static resendConfirmationMail = async (req, res) => {
        try {
            const myCart = await Helper.isThisIdExistInThisModel(req.params.id,cartModel,'cart','products.product','userID')
            if (myCart.status != "verification mode") {
                throw new Error('this action is not for your cart status')
            }
            const confirmation = await tokenModel.creatToken(myCart._id, 0)
            sendmail(myCart.userID.email,"Please confirm your cart",
            `<h1>Email Confirmation</h1>
            <h2>Hello ${myCart.userID.userName}</h2>
            <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
            <a href=http://localhost:3000/ecommerce/cart/callbackcartconfirm/${confirmation}> Click here</a>
            </div>`)
            Helper.formatMyAPIRes(res, 200, true, {}, 'please check your mail quickly you have 10 mins then you will need to send another confirmation mail')
        }
        catch (e) {
            if (e.name == 'Error') {
                Helper.formatMyAPIRes(res, 200, false, e, e.message)
            } else if (e.name == 'MongoServerError' || e.name == 'ValidationError' || e.name == 'CastError') {
                Helper.formatMyAPIRes(res, 400, false, e, e.message)
            }else {
                Helper.formatMyAPIRes(res, 500, false, e, e.message)
            }
        }
    }
    static returnToChange = async (req, res) => {
        try {
            const myCart = await Helper.isThisIdExistInThisModel(req.params.id, cartModel, 'cart')
            if (myCart.status == 'not completed') {
                throw new Error('your cart already in un completed mode')
            }
            if (myCart.status != "verification mode") {
                throw new Error('that is not possible now your already confirm your cart and it ' + myCart.status)
            }
            myCart.status = 'not completed'
            const result = await myCart.save()
            Helper.formatMyAPIRes(res, 200, true, result, 'now you can make changes in your cart ')
        }
        catch (e) {
            if (e.name == 'Error') {
                Helper.formatMyAPIRes(res, 200, false, e, e.message)
            } else if (e.name == 'MongoServerError' || e.name == 'ValidationError' || e.name == 'CastError') {
                Helper.formatMyAPIRes(res, 400, false, e, e.message)
            } else {
                Helper.formatMyAPIRes(res, 500, false, e, e.message)
            }
        }

    }
    static getCartTask = (req, res) => {
        Helper.handlingMyFunction(req, res, (req) => {
            return cartModel.find({ status: { $in: ['is being prepared', 'in its way'] } }).populate('userID')
        }, 'here is the carts that needed to be worked on')
    }
    static nextStep = async (req, res) => {
        try {
            const cart = await Helper.isThisIdExistInThisModel(req.params.id, cartModel, 'cart', 'products.product','userID')
            if (cart.status == 'not completed' || cart.status == "verification mode") {
                throw new Error('the user didn`t complete and verify his cart')
            }
            if (cart.status == 'received') {
                throw new Error('this cart is received ,and there is`t any action else to be done')
            }
            if (cart.status == 'is being prepared') {
                cart.status = 'in its way'
            } else if (cart.status == 'in its way') {
                cart.status = 'received'
            }
            const result = await cart.save()
            user.notify(cart.userID._id,`Hello ${cart.userID.userName},we need to inform you that your cart ${cart.status} ${cart.status=='in its way'?'wait our representative soon':'please inform us with your review or any complain'}`)
            sendmail(cart.userID.email,
                'you cart status',
                `<h1>Email Confirmation</h1>
          <h2>Hello ${cart.userID.userName}</h2>
          <p>we need to inform you that your cart <h4>${cart.status}</h4></p>
          ${cart.status=='in it`s way'?'wait our representative soon':'please inform us with your review or any complain'}
          </div>`)
            Helper.formatMyAPIRes(res, 200, true, result, 'now you can make changes in your cart ')
        } catch (e) {
            if (e.name == 'Error') {
                Helper.formatMyAPIRes(res, 200, false, e, e.message)
            } else if (e.name == 'MongoServerError' || e.name == 'ValidationError' || e.name == 'CastError') {
                Helper.formatMyAPIRes(res, 400, false, e, e.message)
            } else {
                Helper.formatMyAPIRes(res, 500, false, e, e.message)
            }
        }
    }
}
module.exports = Cart