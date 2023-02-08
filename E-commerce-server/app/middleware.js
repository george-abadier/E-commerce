const userModel = require('../db/models/user.model')
const tokenModel = require('../db/models/tokens.model')
const roleModel = require('../db/models/role.model')
const multer = require('multer')
const helper = require('./helper')
const auth = async (req, res, next) => {
    try {
        let token
        if (req.params.confimation) {
            token = req.params.confimation
        } else {
            token = req.header('Authorization')
        }
        const tokenExist = await tokenModel.findOne({ token })
        if (!tokenExist) {
            return helper.formatMyAPIRes(res, 401, false, {}, 'invalid token ')
        }

        const user = await userModel.findById(tokenExist.owner).populate('role').populate('liked')
        if (!user) {
            return helper.formatMyAPIRes(res, 401, false, {}, 'invalid token owner')
        } else {
            if (req.params.confimation) {
                user.date = ""
                user.status = true
                await user.save()
            }
            req.userType = 'user'
            req.user = user
            req.token = token
        }
        next()
    }
    catch (e) {
        console.error(e)
        helper.formatMyAPIRes(res, 500, false, e, e.message)
    }
}

const authToThisRoute = async (req, res, next) => {
    if (!req.user.role) {
        return helper.formatMyAPIRes(res, 401, false, null, 'you aren`t allowed to this route')
    }
    const role = await roleModel.findById(req.user.role._id).populate('routes')
    const allowed = role.routes.find((route, i) => {
        return (route.route == req.baseUrl + (req.route.path == '/' ? '' : req.route.path) && route.method == req.method)
    })
    if (allowed) {
        next()
    } else {
        helper.formatMyAPIRes(res, 401, false, null, 'you aren`t allowed to this route')
    }
}
const uploadfile=(foldername)=>{
    const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `statics/${foldername}/`)
    },
    filename: (req, file, cb) => {
        const myFileName = Date.now() + file.fieldname + file.originalname
        cb(null, myFileName)
    }
})
const upload = multer(
    {
        storage,
        fileFilter: (req, file, cb) => {
            if (file.mimetype != 'image/png' && file.mimetype != 'image/jpg' && file.mimetype != 'image/jpeg' && file.mimetype != "image/svg+xml" && file.mimetype != "image/vnd") {
                cb(null, false)
                cb(new Error('wrong file extention'))
            }
            cb(null, true)
        },
        limits: { fileSize: 5000000 }
    })
    return upload
}
module.exports = { auth, authToThisRoute, uploadfile }