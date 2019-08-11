'use strict'

const fs = require('fs')
const memoize = require('../../cache/memoize')
const mapper = require('../mapper')
const global = require('../../global')
const debug = require('debug')('LI52D-G11:tmdbService')
const utils = require('./serviceUtils')

const apiKey = fs.readFileSync('apikey.txt').toString()
const url = global.tmdb_url

/**
 * Obtain data from provided dataSource and construct a model object(Movie, Actor, Director, etc...)
 * @param {function} dataSource - repository (local or a Web API)
 * @returns {getMovieList, getMovieDetails, getActorDetails}
 */
function init(dataSource) {
	let req
	if( dataSource )
		req = dataSource
	else
		req = require('request')

	return {
		getMovieList,
		'getMovieDetails': memoize(getMovieDetails),
		'getActorDetails': memoize(getActorDetails)
	}

	/**
	 * Search movies using the name provided as a keyword, and organizes the list retrieved by the response in paginated lists
	 * @param {string} query - keyword chosen by user
	 * @param {string} page - corresponding page to obtain more movies
	 * @param {function} cb (err,movieList)
	 */
	function getMovieList(query, page, cb) {
		const movieListPath = url + `/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}`
		reqAsJson(movieListPath, (err, data) => {
			if( err ) return cb(err)
			let movieList = mapper.mapToMovieList(data, query)
			cb(null, movieList)
		})
	}

	/**
	 * Get details of a certain Movie and its cast and directors
	 * @param {number} movieId - identifier of chosen Movie to obtain its various details
	 * @param {function} cb (err,movie)
	 */
	function getMovieDetails(movieId, cb) {
		const movieDetailsPath = url + `/movie/${movieId}?api_key=${apiKey}`
		const movieCreditsPath = url + `/movie/${movieId}/credits?api_key=${apiKey}`
		const processResponses = function(err, results) {
			if( err ) return cb(err)
			let movie = mapper.mapToMovie(results[0])
			movie.directors = mapper.mapToDirector(results[1].crew)
			movie.cast = mapper.mapToCastMember(results[1].cast)
			cb(null, movie)
		}

		const tasks = [
			function(callback) {
				reqAsJson(movieDetailsPath, callback)
			},
			function(callback) {
				reqAsJson(movieCreditsPath, callback)
			}
		]
		utils.parallel(tasks, processResponses)
	}

	/**
	 * Get details of an actor with the id provided, also obtains a list of all movies he participated (filmography)
	 * @param {number} actorId - identifier of chosen Actor to obtain its various details and its Filmography
	 * @param {function} cb (err,actor)
	 */
	function getActorDetails(actorId, cb) {
		const pathToActorPersonalInfo = url + `/person/${actorId}?api_key=${apiKey}`
		const pathToMovieParticipations = url + `/person/${actorId}/movie_credits?api_key=${apiKey}`

		const processResponses = function(err, results) {
			if( err ) return cb(err)
			let actor = mapper.mapToActor(results[0])
			actor.filmography = mapper.mapToFilmography(results[1].cast)
			cb(null, actor)
		}

		const tasks = [
			function(callback) {
				reqAsJson(pathToActorPersonalInfo, callback)
			},
			function(callback) {
				reqAsJson(pathToMovieParticipations, callback)
			}
		]
		utils.parallel(tasks, processResponses)
	}

	/**
	 * Creates an http get request to provided path and retrieve its response as a JSON object
	 * @param path - uri destination of HTTP GET Request
	 * @param callback (err,obj)
	 */
	function reqAsJson(path, callback) {
		req(path, (err, res, data) => {
			debug('Making a request to ' + path)
			if( err ) return callback(err)
			if( res.statusCode !== 200 )
				return callback({ message: 'Something broke!', status: res.statusCode  })
			const obj = JSON.parse(data.toString())
			callback(null, obj)
		})
	}
}

module.exports = init