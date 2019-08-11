'use strict'

/**
 * Middleware
 * Checks if there's an open session. Redirects to signin page if false
 */
module.exports = function(req,res,next){
	if(!req.user){
		return res.redirect('/auth/signin')
	}
	next()
}