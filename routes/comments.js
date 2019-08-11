'use strict'

const app = require('express')
const commentService = require('../domain/service/commentService')()
const router = app.Router()

/**
 * Get comments of specified movie
 */
router.get('/:movieId', function(req, res, next) {
	const movieId = req.params.movieId
	commentService.getCommentsByMovie(movieId, (err, comments) => {
		if( err ) return next(err)
		res.status(200).json(comments)
	})
})

/**
 * Adds a comment (reply or otherwise) to a movie's comment chain
 * If successfully created, 201 status and the comment in the body are returned
 */
router.post('/:movieId', function(req, res, next) {
	if(!req.user) return next({message: 'User does not exist' , status: 401})
	commentService.createComment(
		req.params.movieId,
		req.body.movieName,
		req.user,
		req.body.text,
		req.body.idToReply,
		(err, comment) => {
			if( err ) return next(err)
			res.status(201).json(comment)
		}
	)
})

module.exports = router