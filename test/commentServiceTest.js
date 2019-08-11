'use strict'

const fs = require('fs')

const commentService = require('../domain/service/commentService')(reqToFile)
const serviceUtils = require('../domain/service/serviceUtils')
const Comment = require('../domain/model/Comment')
const User = require('../domain/model/User')

const endpoints = {
	PUT: {
		'http://127.0.0.1:5984/comments/324786': fs.readFileSync('./test/files/commentService/addCommentResp.json').toString(),
		'http://127.0.0.1:5984/users/bruno': fs.readFileSync('./test/files/commentService/updateUserCommentedOn.json').toString()
	},
	POST: {
		'http://127.0.0.1:5984/comments/_all_docs?include_docs=true': fs.readFileSync('./test/files/commentService/getCommentsByUserResp.json').toString(),
	},
	GET: {
		'http://127.0.0.1:5984/comments/324786': fs.readFileSync('./test/files/commentService/getMovieWithOneCommentResp.json').toString(),
		'http://127.0.0.1:5984/comments/28': fs.readFileSync('./test/files/commentService/getCommentResp.json').toString(),
		'http://127.0.0.1:5984/comments/98': fs.readFileSync('./test/files/commentService/getCommentsByMovieResp.json').toString()
	}
}

function reqToFile(options, cb) {
	let data = endpoints[options.method][options.uri]
	if( !data ) return cb(new Error(`No mock file for ${options.method} ${options.uri}`))
	data = JSON.parse(data)
	cb(null, data.res, data.body)
}

function testGetComment(test) {
	commentService.getComment(28, 'HkeTFqHQz', (err, comment) => {
		if( err ) test.ifError(err)
		test.equal(comment.id, 'HkeTFqHQz')
		test.equal(comment.movieId, 28)
		test.equal(comment.movieName, 'Apocalypse Now')
		test.equal(comment.author, 'nunobpinto')
		test.equal(comment.text, 'great war movie')
		test.equal(comment.replies.length, 0)
	})
	test.done()
}

function testGetCommentsByMovie(test) {
	commentService.getCommentsByMovie(98, (err, comments) => {
		if( err ) test.ifError(err)
		test.equal(comments.length, 2)
		test.equal(comments[0].id, 'B1ttc5SXf')
		test.equal(comments[0].movieId, 98)
		test.equal(comments[0].movieName, 'Gladiator')
		test.equal(comments[0].author, 'nunobpinto')
		test.equal(comments[0].text, 'great drama')
		test.equal(comments[0].replies.length, 1)
		test.equal(comments[0].replies[0].id, 'ByF15qrQM')
		test.equal(comments[0].replies[0].movieId, 98)
		test.equal(comments[0].replies[0].movieName, 'Gladiator')
		test.equal(comments[0].replies[0].author, 'gameiro')
		test.equal(comments[0].replies[0].text, 'agreed')
		test.equal(comments[1].id, 'B1tt5qrQM')
		test.equal(comments[1].movieId, 98)
		test.equal(comments[1].movieName, 'Gladiator')
		test.equal(comments[1].author, 'bruno')
		test.equal(comments[1].text, 'disappointed')
		test.equal(comments[1].replies.length, 0)
	})
	test.done()
}

function testGetCommentsByUser(test) {
	commentService.getCommentsByUser('nunobpinto', [78, 550], (err, comments) => {
		if( err ) test.ifError(err)
		test.equal(comments.length, 2)
		test.equal(comments[0].id, 'r1rz_cSQM')
		test.equal(comments[0].movieId, 78)
		test.equal(comments[0].movieName, 'Blade Runner')
		test.equal(comments[0].author, 'nunobpinto')
		test.equal(comments[0].text, 'best ever made')
		test.equal(comments[0].replies.length, 0)
		test.equal(comments[1].id, 'SJXi5crXz')
		test.equal(comments[1].movieId, 550)
		test.equal(comments[1].movieName, 'Fight Club')
		test.equal(comments[1].author, 'nunobpinto')
		test.equal(comments[1].text, 'favourite of all time')
		test.equal(comments[1].replies.length, 0)
	})
	test.done()
}

function testCreateComment(test) {
	const user = new User('bruno', '123', 'Bruno Filipe', 'bruno@email.com', [], [], '123')
	commentService.createComment(324786, 'Hacksaw Ridge', user, 'great war movie', null, (err, comment) => {
		if( err ) test.ifError(err)
		test.equal(user.commentedOn[0], 324786)
		test.equal(serviceUtils.validateId(comment.id), true)
		test.equal(comment.movieId, 324786)
		test.equal(comment.movieName, 'Hacksaw Ridge')
		test.equal(comment.author, 'bruno')
		test.equal(comment.text, 'great war movie')
		test.equal(comment.replies.length, 0)
	})
	test.done()
}

module.exports = {
	testGetComment,
	testGetCommentsByMovie,
	testGetCommentsByUser,
	testCreateComment
}
