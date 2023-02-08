const Helper = require("../helper")
const productModel = require('../../db/models/products.model')
const categoryModel = require("../../db/models/category.model")
const { upload } = require("../middleware")
const multer = require('multer')
class Product {
    static add = (req, res) => {
        Helper.handlingMyFunction(req, res, (req) => {
            let product
            if (req.user.role.role == 'admin') {
                product = productModel({ ...req.body, ourOwn: true })
            } else {
                product = productModel({ ...req.body, ourOwn: false, from: req.user._id })
            }
            return product.save()
        }, 'product added successfully')
    }
    static delete = (req, res) => {
        Helper.handlingMyFunction(req, res, async (req) => {
            return this.ifYoursD0(req, (req) => { return productModel.findByIdAndDelete(req.params.id) })
        }, 'product deleted successfully')
    }
    static edit = (req, res) => {
        Helper.handlingMyFunction(req, res, (req) => {
            return this.ifYoursD0(req, (req) => { return productModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { returnDocument: 'after' }) })
        }, 'product edited successfully')
    }
    static getAll = (req, res) => {
        Helper.handlingMyFunction(req, res, (req) => {
            return productModel.find().populate('from')
        }, 'here is all products')
    }
    static getSingle = (req, res) => {
        Helper.handlingMyFunction(req, res, async (req) => {
            return Helper.isThisIdExistInThisModel(req.params.id, productModel, 'product', 'from')
        }, 'here is your product')
    }
    static getByCategory = (req, res) => {
        Helper.handlingMyFunction(req, res, (req) => {
            Helper.isThisIdExistInThisModel(req.params.catId, categoryModel, 'category')
            return productModel.find({category:req.params.catId}).populate('from')
        }, 'here is this category product')
    }
    static rate = async (req, res) => {
        try {
            const product = await Helper.isThisIdExistInThisModel(req.params.id, productModel, 'product')
            if (isNaN(req.body.rate)) {
                const e = new Error(`rate must be a number`)
                e.name = 'ValidationError'
                throw e
            }
            const i = product.ratings.findIndex(rate => { return String(req.user._id) == String(rate.userID) })
            if (i != -1) {
                console.log()
                product.updateOverALLRate(parseInt(req.body.rate), false, product.ratings[i].rate)
                product.ratings[i] = { ...req.body, userID: req.user._id }
            } else {
                product.ratings.push({ ...req.body, userID: req.user._id })
                product.updateOverALLRate(parseInt(req.body.rate), true)
            }
            const result = await product.save()
            Helper.formatMyAPIRes(res, 200, true, result, 'here the rates sorted')
        }
        catch (e) {
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

    static showProductRatings = async (req, res) => {
        try {
            const product = await Helper.isThisIdExistInThisModel(req.params.id, productModel, 'product')
            const ratings = product.ratings
            ratings.sort((a, b) => b.helpful - a.helpful)
            Helper.formatMyAPIRes(res, 200, true, ratings, 'here the rates sorted')
        }
        catch (e) {
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
    static moreHelpful = (req, res) => {
        Helper.handlingMyFunction(req, res, async (req) => {
            const product = await Helper.isThisIdExistInThisModel(req.params.productID, productModel, 'product')
            console.log(product)
            const i = product.ratings.findIndex(rate => { return rate._id == req.params.rateID })
            console.log(i, product[i])
            if (i == -1) {
                const e = new Error('this rate does exist')
                e.name = 'ValidationError'
                throw e
            }
            product.ratings[i].helpful++
            return product.save()
        }, 'increased')
    }
    static ifYoursD0 = async (req, fun) => {
        const product = await Helper.isThisIdExistInThisModel(req.params.id, productModel, 'product')
        if (product.ourOwn) {
            if (req.user.role.role != 'admin') {
                const e = new Error('this product does not belong to you to delete')
                e.name = 'ValidationError'
                throw e
            }
            return fun(req)
        } else {
            if (String(product.from) != String(req.user._id)) {
                const e = new Error('this product does not belong to you to delete')
                e.name = 'ValidationError'
                throw e
            }
            return fun(req)
        }
    }
}
const addCategory = (req, res) => {
    Helper.handlingMyFunction(req, res, async (req) => {
        const categoyAlreadyExist = await categoryModel.findOne({ name: { '$regex': req.body.name, $options: 'i' } })
        if (categoyAlreadyExist) {
            console.log(categoyAlreadyExist)
            throw new Error('this category is already exist')
        } else {
            return categoryModel(req.body).save()
        }
    }, 'the new category added successfuly')
}
const addCategoryIcon = (req, res) => {
    const uploadThisIcon = upload.single('caticon')
    uploadThisIcon(req, res, async function (e) {
        if (e instanceof multer.MulterError)
            Helper.formatMyAPIRes(res, 500, false, e, e.message + 'its a multer error')
        else if (e) {
            Helper.formatMyAPIRes(res, 500, false, e, e.message)
        }
        else {
            try {
                let icon = req.file.path.replace('statics\\', '')
                console.log(icon)
                icon = 'http://localhost:3000/' + icon.replace('\\', '/')
                console.log(icon)
                const result = await categoryModel.findByIdAndUpdate(req.params.id, { $set: { icon } }, { returnDocument: 'after' })
                Helper.formatMyAPIRes(res, 200, true, { file: req.file, result }, 'your post added successfully')
            }
            catch (e) {
                Helper.formatMyAPIRes(res, 500, false, e, e.message)
            }
        }
    })
}
const deleteCategory = (req, res) => {
    Helper.handlingMyFunction(req, res, async (req) => {
        const categoryExist = await categoryModel.findById(req.params.id)
        if (categoryExist) {
            return categoryModel.findByIdAndDelete(req.params.id)
        } else {
            const e = new Error('this category is not exist')
            e.name = 'MongoServerError'
            throw e
        }
    }, 'this category is deleted')
}
module.exports = { Product, addCategory, addCategoryIcon, deleteCategory }