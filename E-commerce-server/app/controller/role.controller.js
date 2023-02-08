const roleModel = require('../../db/models/role.model')
const routeModel = require('../../db/models/route.model')
const { handlingMyFunction } = require('../helper')
const Helper = require('../helper')
class Role {
    static addRole = (req, res) => {
        Helper.handlingMyFunction(req, res, async (req) => {
            const role = roleModel(req.body)
            return role.save()
        }, 'you insert your role successfully')
    }
    static deleteRole = (req, res) => {
        Helper.handlingMyFunction(req, res, (req) => {
            return roleModel.findByIdAndDelete(req.params.id)
        }, 'role deleted')
    }
    static getRole = (req, res) => {
        Helper.handlingMyFunction(req, res, (req) => {
            return Helper.isThisIdExistInThisModel(req.params.id,roleModel,'role')
        }, 'here is your role')
    }
    static getRoles = (req, res) => {
        handlingMyFunction(req, res, (req) => {
            return roleModel.find()
        }, 'here is all roles')
    }
    static editRole = (req, res) => {
        Helper.handlingMyFunction(req, res, (req) => {
            return roleModel.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' })
        }, 'here is your role')
    }
    static addRouteToRole = (req, res) => {
        Helper.handlingMyFunction(req, res, async (req) => {
            const role = await  Helper.isThisIdExistInThisModel(req.params.id,roleModel,'role')
             await  Helper.isThisIdExistInThisModel(req.body.route,routeModel,'route')
            const route = role.routes.find(R => { return R == req.body.route })
            if (route) {
                throw new Error('this role already have this route')
            } else {
                role.routes.push(req.body.route)
                return role.save()
            }
        }, 'you added the route saccessfuly')
    }
    static deleteRouteFromRole = (req, res) => {
        Helper.handlingMyFunction(req, res, async (req) => {
            const role = await  Helper.isThisIdExistInThisModel(req.params.id,roleModel,'role')
            await  Helper.isThisIdExistInThisModel(req.body.route,routeModel,'route')
            const i = role.routes.findIndex(R => { return R == req.body.route })
            console.log(i)
            if (i == -1) {
                throw new Error('this role didn`t have this route')
            } else {
                role.routes.splice(i, 1)
                return role.save()
            }
        }, 'route deleted')
    }
}
const getRoutes = (req, res) => {
    handlingMyFunction(req, res, (req) => {
        return routeModel.find({ routeAction: { $ne: '' } })
    }, 'here is all permissions')
}
const editRouteAction = (req, res) => {
    handlingMyFunction(req, res,async (req) => {
        const route=await  Helper.isThisIdExistInThisModel(req.body.route,routeModel,'route')
        if(route){
            return routeModel.findByIdAndUpdate(req.params.id, { routeAction: req.params.newName }, { returnDocument: 'after' })
        }
    }, 'name changed successfully')
}
//developer methods .....to be removed after development mood.........
const deleteRoute = (req, res) => {
    Helper.handlingMyFunction(req, res, async (req) => {
        const roles = await roleModel.find()
        roles.forEach(async (role) => {
            role.routes = role.routes.filter(route => { return route != req.params.id })
            await role.save()
        })
        await routeModel.findByIdAndDelete(req.params.id)
    }, 'you insert your route successfully')
}
const addRoute = (req, res) => {
    Helper.handlingMyFunction(req, res, (req) => {
        const route = routeModel(req.body)
        return route.save()
    }, 'you delete your route successfully')
}
module.exports.Role = Role
module.exports.editRouteAction = editRouteAction
module.exports.addRoute = addRoute
module.exports.getRoutes = getRoutes
module.exports.deleteRoute = deleteRoute