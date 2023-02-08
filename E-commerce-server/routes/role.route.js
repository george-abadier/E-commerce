const { auth, authToThisRoute } = require('../app/middleware')
const { editRouteAction, getRoutes, deleteRoute, addRoute, Role } = require('../app/controller/role.controller')
const router = require('express').Router()
//route routes to be removed
router.post('/route', addRoute)
router.delete('/route/:id', deleteRoute)
//accessable route routes
router.get('/routes', auth, authToThisRoute, getRoutes)
router.put('/route/:id/:newName', auth, authToThisRoute, editRouteAction)
//................................................................................
//role routes
router.post('/', auth, authToThisRoute, Role.addRole)
router.delete('/:id', auth, authToThisRoute, Role.deleteRole)
router.get('/all', auth, authToThisRoute, Role.getRoles)
router.get('/:id', auth, authToThisRoute, Role.getRole)
router.put('/:id', auth, authToThisRoute, Role.editRole)
router.put('/routetorole/:id', auth, authToThisRoute, Role.addRouteToRole)
router.delete('/routetorole/:id', auth, authToThisRoute, Role.deleteRouteFromRole)
module.exports = router