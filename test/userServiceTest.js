'use strict'

const fs = require('fs')

const userService = require('../domain/service/userService')(reqToFile)
const User = require('../domain/model/User')

const endpoints = {
	DELETE: {
		'http://127.0.0.1:5984/users/zemanel?rev=123124': fs.readFileSync('./test/files/userService/deleteUser.json').toString()
	},
	PUT: {
		'http://127.0.0.1:5984/users/zemanel': fs.readFileSync('./test/files/userService/createUser.json').toString()
	},
	GET: {
		'http://127.0.0.1:5984/users/zemanel': fs.readFileSync('./test/files/userService/getUser.json').toString()
	}
}

function reqToFile(options, cb) {
	let data = endpoints[options.method][options.uri]
	if( !data ) return cb(new Error(`No mock file for ${options.method} ${options.uri}`))
	data = JSON.parse(data)
	cb(null, data.res, data.body)
}

function testGetUserById(test) {
	userService.getUser('zemanel', '123', (err, user) => {
		if( err )
			test.ifError(err)
		else {
			test.equal(user.username, 'zemanel')
			test.equal(user.password, '123')
			test.equal(user.fullName, 'Ze Manel')
			test.equal(user.email, 'zemanel@gmail.com')
			test.equal(user.lists[0], '12345')
			test.equal(user.lists[1], '6789')
			test.equal(user._rev, '123123')
		}
		test.done()
	})
}

function testCreateUser(test) {
	userService.createUser('zemanel', '123', 'Ze Manel', 'zemanel@gmail.com', (err, user) => {
		if( err )
			test.ifError(err)
		else {
			test.equal(user.username, 'zemanel')
			test.equal(user.password, '123')
			test.equal(user.fullName, 'Ze Manel')
			test.equal(user.email, 'zemanel@gmail.com')
			test.equal(user.lists.length, 0)
			test.equal(user._rev, '123123')
		}
		test.done()
	})
}

function testDeleteUser(test) {
	const user = new User('zemanel', '123', 'Ze Manel', 'zemanel@email.com', [], [], '123124')
	userService.deleteUser(user, (err) => {
		if( err )
			test.ifError(err)
		test.done()
	})
}

module.exports = {
	testGetUserById,
	testCreateUser,
	testDeleteUser
}