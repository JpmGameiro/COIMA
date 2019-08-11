'use strict'

const global = require('../../global')
const mapper = require('../mapper')
const utils = require('./serviceUtils')
const debug = require('debug')('LI52D-G11:commentService')

const commentsUrl = global.couchdb_url + '/comments/'
const usersUrl = global.couchdb_url + '/users/'

/**
 * Obtain data from provided dataSource and manages movie commenting interaction with application
 * @param dataSource
 * @returns {{getComment: getComment, getCommentsByMovie: getCommentsByMovie, getCommentsByUser: getCommentsByUser, createComment: createComment}}
 */
function init(dataSource) {
	let req
	if( dataSource )
		req = dataSource
	else
		req = require('request')

	return {
		getComment,
		getCommentsByMovie,
		getCommentsByUser,
		createComment
	}

	/**
	 * Find comment by its id in the specified movie's comments
	 * @param {number} movieId
	 * @param {string} commentId
	 * @param {function} cb(err, Comment)
	 */
	function getComment(movieId, commentId, cb) {
		debug(`Fetching comment with id = "${commentId}" from movie with id = "${movieId}"`)
		req(utils.optionsBuilder(commentsUrl + movieId), (err, res, data) => {
			if( err ) return cb(err)
			const comment = findCommentById(data.comments, commentId)
			cb(null, comment)
		})
	}

	/**
	 * Get all comments on the specified movie
	 * @param {number} movieId
	 * @param {function} cb(err, Array<Comment>)
	 */
	function getCommentsByMovie(movieId, cb) {
		debug(`Fetching comments from movie with id = "${movieId}"`)
		req(utils.optionsBuilder(commentsUrl + movieId), (err, res, data) => {
			if( err ) return cb(err)
			cb(null, data.comments)
		})
	}

	/**
	 * Finds all comments written by specified user
	 * @param {string} username
	 * @param {Array<number>} movieIds
	 * @param {function} cb(err, Array<Comment>)
	 */
	function getCommentsByUser(username, movieIds, cb) {
		debug(`Fetching comments from user with id = "${username}"`)
		req(utils.optionsBuilder(commentsUrl + '_all_docs?include_docs=true', 'POST', { keys: movieIds }), (err, res, data) => {
			if( err ) return cb(err)
			let comments = []
			data.rows.forEach((item) => {
				findCommentsByUser(item.doc.comments, username, comments)
			})
			cb(null, comments)
		})
	}

	/**
	 * Creates a comment on a movie (if comment document doesn't exist, it's created)
	 * If @param idToReply is passed, then the comment created is a reply to the comment with that id
	 * @param {number} docId
	 * @param {string} movieName
	 * @param {User} user
	 * @param {string} text
	 * @param {string} idToReply
	 * @param {function} cb(err, Comment)
	 */
	function createComment(docId, movieName, user, text, idToReply, cb) {
		debug(`Creating a comment on movie with id = "${docId}"`)
		//Get comment document
		req(utils.optionsBuilder(commentsUrl + docId), (err, res, jsonComments) => {
			if( err ) return cb(err)

			const comment = {
				id: utils.generateId(),
				movieName: movieName,
				movieId: docId,
				author: user.username,
				text: text,
				replies: []
			}
			if( res.statusCode === 404 ) return createCommentDoc(docId, comment, user, cb)

			if( idToReply ) findComment(jsonComments.comments, idToReply, comment)
			else jsonComments.comments.unshift(comment)
			//Either insert new document or update existing one
			req(utils.optionsBuilder(commentsUrl + docId, 'PUT', jsonComments), (err, res, data) => {
				if( err ) return cb(err)
				if( res.statusCode > 400 ) return cb({ message: 'Something broke!', status: res.statusCode })

				if( user.commentedOn.some(doc => doc === docId) ) return cb(null, comment)

				user.commentedOn.push(docId)
				//Updates user with new doc
				req(utils.optionsBuilder(usersUrl + user.username, 'PUT', user), (err, res, data) => {
					if( err ) return cb(err)

					cb(null, comment)
				})
			})
		})
	}

	function createCommentDoc(docId, comment, user, cb) {
		debug(`Creating comment chain for movie with id = ${docId}`)
		const commentDoc = { comments: [comment] }
		req(utils.optionsBuilder(commentsUrl + docId, 'PUT', commentDoc), (err, res, data) => {
			if( err ) return cb(err)
			if( res.statusCode === 409 ) return cb()

			if( user.commentedOn.some(doc => doc === docId) ) return cb(null, comment)

			user.commentedOn.push(docId)
			//Updates user with new doc
			req(utils.optionsBuilder(usersUrl + user.username, 'PUT', user), (err, res, data) => {
				if( err ) return cb(err)

				cb(null, comment)
			})
		})
	}

	function findComment(commentChain, idToReply, reply) {
		commentChain.forEach((comment) => {
			if( comment.id === idToReply )
				return comment.replies.unshift(reply)
			findComment(comment.replies, idToReply, reply)
		})
	}

	function findCommentById(commentChain, id) {
		for( let i = 0; i < commentChain.length; ++i ) {
			if( commentChain[i].id === id )
				return commentChain[i]
			findCommentById(commentChain[i].replies, id)
		}
	}

	function findCommentsByUser(commentChain, username, array) {
		commentChain.forEach((comment) => {
			if( comment.author === username )
				array.push(mapper.mapToComment(comment))
			findCommentsByUser(comment.replies, username, array)
		})
	}
}

module.exports = init