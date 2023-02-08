const Helper = require("../helper")
const { sendmail } = require("../mail")
const userModel = require('../../db/models/user.model')
const tokenModel = require('../../db/models/tokens.model')
const jwt = require('jsonwebtoken')
const roleModel = require("../../db/models/role.model")
const { uploadfile } = require("../middleware")
const multer = require("multer")
class User {
    static signUp = async (req, res) => {
        try {
            const fullNameReg = /^[a-zA-z]{3,}\s{1}[a-zA-Z]{3,}$/
            const passReg = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})')
            if (!fullNameReg.test(req.body.userName)) {
                throw new Error('your name doesn`t match the rules')
            }
            if (!passReg.test(req.body.password)) {
                throw new Error('your password doesn`t match the rules')
            }
            const user = userModel(req.body)
            const token = await tokenModel.creatToken(user._id)
            sendmail(user.email,'Please confirm your account',
            `<h1>Email Confirmation</h1>
          <h2>Hello ${user.userName}</h2>
          <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
          <a href=http://localhost:3000/ecommerce/user/confirm/${token}> Click here</a>
          </div>`)
            await tokenModel({ token, owner: user._id, date: new Date() }).save()
            await user.save()
            Helper.formatMyAPIRes(res, 200, true, {}, 'check your mail for confirmation')
        }
        catch (e) {
            console.log(e)
            if (e.name == 'MongoServerError' || e.name == 'ValidationError' || e.name == 'Error'|| e.name == 'CastError') {
                Helper.formatMyAPIRes(res, 400, false, e, e.message)
            } else {
                Helper.formatMyAPIRes(res, 500, false, e, e.message)
            }
        }
    }
    static logIn = async (req, res) => {
        try {
            const userData = await userModel.logIn(req.body.email, req.body.password)
            if (!userData.status) {
                throw new Error('please go to your mail to confirm you sign up')
            }
            const token = await tokenModel.creatToken(userData._id, req.body.rememberMe)
            if (req.body.rememberMe) {
                tokenModel({ token, owner: userData._id }).save()
            } else {
                tokenModel({ token, owner: userData._id, date: new Date() }).save()
            }
            Helper.formatMyAPIRes(res, 200, true, { userData, token }, "you logged in successfully,here is you profile&your token")
        }
        catch (e) {
            console.log(e)
            if (e.name == 'Error') {
                Helper.formatMyAPIRes(res, 200, false, e, e.message)
            } else if (e.name == 'MongoServerError' || e.name == 'ValidationError'|| e.name == 'CastError') {
                Helper.formatMyAPIRes(res, 400, false, e, e.message)
            } else {
                Helper.formatMyAPIRes(res, 500, false, e, e.message)
            }
        }
    }
    static logInByApps = async (req, res) => {
        try {
            console.log(req.user.emails[0])
            const user = await userModel.findOne({ email: req.user.emails[0].value })
            if (!user) {
                throw new Error('the owner of this account have no account in E-commerce ')
            }
            const token = await tokenModel.creatToken(user._id, false)
            await tokenModel({ token, owner: user._id, date: new Date() }).save()
            Helper.formatMyAPIRes(res, 200, true, { user, token }, "you logged in successfully,here is you profile&your token")
        }
        catch (e) {
            console.log(e)
            if (e.name == 'MongoServerError' || e.name == 'ValidationError' || e.name == 'Error'|| e.name == 'CastError') {
                Helper.formatMyAPIRes(res, 400, false, e, e.message)
            } else {
                Helper.formatMyAPIRes(res, 500, false, e, e.message)
            }
        }
    }
    static forgetMyPass = (req, res) => {
        Helper.handlingMyFunction(req, res, async (req) => {
            const user = await userModel.findOne({ email: req.body.email })
            console.log(req.body.email)
            if (!user) {
                const e = new Error('there is no such email')
                e.name = 'MongoServerError'
                throw e
            }
            const token = await tokenModel.creatToken(user._id, false)
            sendmail(req.body.email,'change your pass from here',
            `<h1>Email for reset your password</h1>
          <h2>Hello ${user.userName}</h2>
          <form method="post" action="http://localhost:3000/ecommerce/user/forgetpass/changepass/${token}">
		<div><label for="email">your email</label>: <input value='${req.body.email}' style=" display: block;
	width: 100%;
	padding: 0.375rem 0.75rem;
	font-size: 1rem;
	font-weight: 400;
	line-height: 1.5;
	color: #212529;
	background-color: #fff;
	background-clip: padding-box;
	border: 1px solid #ced4da;
	-webkit-appearance: none;
	-moz-appearance: none;
	appearance: none;
	border-radius: 0.375rem;
	transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
	" type="email" name="email" id="email" required></div>
		<div><label for="password">enter your new password</label>: <input style=" display: block;
	width: 100%;
	padding: 0.375rem 0.75rem;
	font-size: 1rem;
	font-weight: 400;
	line-height: 1.5;
	color: #212529;
	background-color: #fff;
	background-clip: padding-box;
	border: 1px solid #ced4da;
	-webkit-appearance: none;
	-moz-appearance: none;
	appearance: none;
	border-radius: 0.375rem;
	transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
	" type="password" name="password" id="password" required
				pattern='(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})'></div>
		<div><input style="
		background-color:#0d6efd ; color: #fff;
  --bs-btn-bg: #0d6efd;
  border-color: #0d6efd;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #0b5ed7;
  --bs-btn-hover-border-color: #0a58ca;
  --bs-btn-focus-shadow-rgb: 49, 132, 253;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #0a58ca;
  --bs-btn-active-border-color: #0a53be;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #fff;
  --bs-btn-disabled-bg: #0d6efd;
  --bs-btn-disabled-border-color: #0d6efd;" type="submit" value="submit"></div>
	</form></div>`)
        }, 'check your mail')
    }
    static resetPass = async (req, res) => {
        try {
            jwt.verify(req.params.token, process.env.tokenPass)
            const user = await userModel.findOne({ email: req.body.email })
            user.password = req.body.password
            await tokenModel.deleteMany({ owner: user._id })
            const result = await user.save()
            Helper.formatMyAPIRes(res, 200, true, result, 'now try to login again with your new password')
        } catch (e) {
            console.log(e)
            if (e.name == "TokenExpiredError") {
                Helper.formatMyAPIRes(res, 200, false, {}, 'this mail was valid for 10 minute,resend another mail to reset your pass if you still forgetting your pass')
            } else {
                Helper.formatMyAPIRes(res, 500, false, e, e.message)
            }
        }
    }
    static logOut = (req, res) => {
        Helper.handlingMyFunction(req, res, async (req) => {
            await tokenModel.findOneAndDelete({ token: req.token })
        }, 'logged out successfully')
    }
    static getPrivacyPolicy = (req, res) => {
        res.redirect('https://www.freeprivacypolicy.com/live/bb68c15e-9654-4bb7-b18b-8ec61729fedf')
    }
    static myProfile = (req, res) => {
        Helper.handlingMyFunction(req, res, (req) => {
            if (req.params.confimation) {
                return { user: req.user, token: req.token }
            } else {
                return req.user
            }
        }, 'congratulation you made a new account here is your profile')
    }
    static uploadMyImage=(req,res)=>{
        const upload=uploadfile('usersimages')
        const uploadImage = upload.single('image')
        uploadImage(req, res, async function (e) {
            if (e instanceof multer.MulterError)
                Helper.formatMyAPIRes(res, 500, false, e, e.message + 'its a multer error')
            else if (e) {
                Helper.formatMyAPIRes(res, 500, false, e, e.message)
            }
            else {
                try {
                    let image = req.file.path.replace('statics\\', '')
                    image = 'http://localhost:3000/' + image.replace('\\', '/')
                    const result = await userModel.findByIdAndUpdate(req.user._id, { $set: { image } }, { returnDocument: 'after' })
                    Helper.formatMyAPIRes(res, 200, true, { file: req.file, result }, 'your post added successfully')
                }
                catch (e) {
                    Helper.formatMyAPIRes(res, 500, false, e, e.message)
                }
            }
        })
    } 
    static editMyData=(req,res)=>{
        Helper.handlingMyFunction(req,res,(req)=>{
            for(let key in req.body){
                if(key=='gender'||key=='age'||key=='userName'||key=='email'||key=='password'){
                    req.user[key]=req.body[key]
                }
            }
            return req.user.save()
        },'the date that you able to update fro this api is updated')
    }
    static addPhoneNum=(req,res)=>{
        Helper.handlingMyFunction(req,res,(req)=>{
            req.user.phoneNums.push(req.body)
            return req.user.save()
        },'your number added successfully')
    }
    static changeRole = async (req, res) => {
        try {
            const isRoleExist = await roleModel.findById(req.body.role)
            if (!isRoleExist) {
                throw new Error('the new role you adding to this user is not listed')
            }
            const result = await userModel.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' })
            if (!result) {
                throw new Error('the user is not exist')
            }
            Helper.formatMyAPIRes(res, 200, true, result, 'the user now have his new role')
        } catch (e) {
            console.log(e)
            if (e.name == 'MongoServerError' || e.name == 'ValidationError' || e.name == 'Error'|| e.name == 'CastError') {
                Helper.formatMyAPIRes(res, 400, false, e, e.message)
            } else {
                Helper.formatMyAPIRes(res, 500, false, e, e.message)
            }
        }
    }
    static getUserData = (req, res) => {
        Helper.handlingMyFunction(req, res, async (req) => {
            const user = await userModel.findById(req.params.id).populate('role')
            if (!user) {
                const e = new Error('this user is not exist')
                e.name = 'MongoServerError'
                throw e
            } else {
                return user
            }
        }, 'here is the user you want')
    }
    static getAllUsers = (req, res) => {
        Helper.handlingMyFunction(req, res, (req) => {
            return userModel.find().populate('role')
        }, "here is all the users")
    }
}
module.exports = User