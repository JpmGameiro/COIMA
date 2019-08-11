'use strict'

const app = require('express')
const movieService = require('../domain/service/tmdbService')()
const listService = require('../domain/service/userListService')()
const router = app.Router()

/**
 * Shows paginated search results
 */
router.get('/search', function(req, res, next) {
	const name = req.query['name']
	const page = req.query['page']
	movieService.getMovieList(name, page, (err, data) => {
		if( err ) return next(err)
		res.render('movieList', data)
	})
})

/**
 * Shows movie information, its directors and cast
 */
router.get('/:movieId', function(req, res, next) {
	const movieId = req.params.movieId
	movieService.getMovieDetails(movieId, (err, movie) => {
		if( err ) return next(err)
		if( !req.user ) return res.render('movieDetails', { movie: movie })
		listService.getListsByUser(req.user.lists, (err, lists) => {
			if( err ) return next(err)
			const editLists = lists.filter(item =>
				item.guests.find(guest => guest.username === req.user.username && guest.permission === 'edit')
					|| req.user.username === item.owner
			)
			res.render('movieDetails', { movie: movie, lists: editLists })
		})
	})
})

module.exports = router

