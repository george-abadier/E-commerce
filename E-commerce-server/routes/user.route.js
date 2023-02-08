const User = require('../app/controller/user.controller')
require('../app/passport')
const passport = require('passport');
const { authToThisRoute, auth } = require('../app/middleware')
const router = require('express').Router()
// sign up
router.post('/signup', User.signUp)
router.get('/confirm/:confimation', auth, User.myProfile)
// login with another app
router.get('/fail', (req, res) => { res.status(500).send({ apiStatus: false, data: {}, apiMessage: 'somthing go wrong please try to log in again' }) })
router.get('/good', User.logInByApps)
// with facebook
router.get('/facebooklogin', passport.authenticate('facebook', { scope: 'email' }))
router.get('/facebooklogin/callback', passport.authenticate('facebook', { successRedirect: '/ecommerce/user/good', failureRedirect: '/ecommerce/user/fail' }))
// with google
router.get('/googlelogin', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/googlelogin/callback', passport.authenticate('google', { failureRedirect: '/ecommerce/user/fail' }), (req, res) => { res.redirect('/ecommerce/user/good'); })
// login with username &pass
router.post('/login', User.logIn)
// forget pass
router.post('/forgetpass', User.forgetMyPass)
router.post('/forgetpass/changepass/:token', User.resetPass)
// log Out
router.get('/logout', auth, User.logOut)


router.get('/myprofile', auth, User.myProfile)
router.put('/myimage', auth, User.uploadMyImage)
router.put('/mydata', auth, User.editMyData)
router.put('/addnum',auth,User.addPhoneNum)


// privacy policy
router.get('/privacypolicy', User.getPrivacyPolicy)
// only allowed to admin
router.put('/changerole/:id', auth, authToThisRoute, User.changeRole)
router.get('/all', auth, authToThisRoute, User.getAllUsers)
router.get('/:id', auth, authToThisRoute, User.getUserData)

module.exports = router

