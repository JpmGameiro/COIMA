'use strict'

const app = require('express')
const router = app.Router()
const userService = require('../domain/service/userService')()
const passport = require('passport')

/**
 * Shows the signin page
 */
router.get('/signin',function (req, res) {
	const ctx = {}
	const msg = req.flash('loginError')
	if(msg) ctx.loginError = {message: msg}
	res.render('signin', ctx)
})

/**
 * Signs in the user through passport
 */
router.post('/signin', function (req, res, next) {
	userService.getUser(req.body.username, req.body.password, (err, user, info) => {
		if(err) return next(err)
		if(info) {
			req.flash('loginError', info)
			return res.redirect('/auth/signin')
		}
		req.logIn(user, (err) => {
			if(err) return next(err)
			res.redirect('/home')
		})
	})
})

/**
 * Shows the user register page
 */
router.get('/register', function (req, res) {
	const ctx = {}
	const msg = req.flash('registerError')
	if(msg) ctx.registerError = {message:msg}
	res.render('register', ctx)
})

/**
 * Registers user in CouchDb and opens session with passport
 */
router.post('/register', function (req, res, next) {
	userService.createUser(req.body.username, req.body.password, req.body.fullName, req.body.email, (err, user, info) => {
		if(err) return next(err)
		if(info){
			req.flash('registerError', info)
			return res.redirect('/auth/register')
		}
		req.logIn(user, (err) => {
			if(err) return next(err)
			res.redirect('/home')
		})
	})
})

/**
 * Signs user out, redirects to homepage
 */
router.get('/signout',function (req, res) {
	req.logout()
	res.redirect('/home')
})

passport.serializeUser(function(user, cb) {
	cb(null, user.username)
})

passport.deserializeUser(function(username, cb) {
	userService.findById(username, cb)
})

module.exports = router