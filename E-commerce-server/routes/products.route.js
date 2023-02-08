const { Product, addCategory, addCategoryIcon, deleteCategory } = require('../app/controller/products controller')
const { authToThisRoute, auth } = require('../app/middleware')
const router = require('express').Router()
//category routes
router.post('/category', auth, authToThisRoute, addCategory)
router.delete('/category/:id', auth, authToThisRoute, deleteCategory)
router.put('/categoryicon/:id', auth, authToThisRoute, addCategoryIcon)
//---------------------------------------------------------------------------------
//sallers & admins routes
router.post('/', auth, authToThisRoute, Product.add)
router.delete('/:id', auth, authToThisRoute, Product.delete)
router.put('/:id', auth, authToThisRoute, Product.edit)
router.put('/addImage/:id',auth,authToThisRoute,Product.uploadNewImage)
//users routes
router.get('/', Product.getAll)
router.get('/bycat/:catId', Product.getByCategory)
router.get('/liked',auth,Product.getLikedPro)
router.get('/myproducts',auth,authToThisRoute,Product.getMyProduct)
router.get('/:id', Product.getSingle)
router.post('/rate/:id', auth, Product.rate)
router.get('/showRatings/:id', Product.showProductRatings)
router.put('/blogmoreHelpful/:productID/:rateID', auth, Product.moreHelpful)
router.put('/like/:id',auth,Product.addToMyLikedList)
module.exports = router