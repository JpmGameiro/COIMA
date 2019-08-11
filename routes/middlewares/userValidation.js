'use strict'

module.exports = function (req, res, next) {
    if(req.user.username !== req.params.username){
        let err = new Error('User Not Found')
        err.status = 404
        return next(err)
    }
    next()
}
