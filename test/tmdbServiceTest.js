'use strict'

const fs = require('fs')

const endPoints = {
	'https://api.themoviedb.org/3/search/movie?api_key=98deea9e9512d3124b9fe528f476c51d&query=war%20games&page=1':
								fs.readFileSync('./test/files/tmdbService/wargamesSearch.json').toString(),
	'https://api.themoviedb.org/3/movie/860?api_key=98deea9e9512d3124b9fe528f476c51d':
								fs.readFileSync('./test/files/tmdbService/wargamesDetails.json').toString(),
	'https://api.themoviedb.org/3/movie/860/credits?api_key=98deea9e9512d3124b9fe528f476c51d':
								fs.readFileSync('./test/files/tmdbService/wargamesCharacters.json').toString(),
	'https://api.themoviedb.org/3/person/4756/movie_credits?api_key=98deea9e9512d3124b9fe528f476c51d':
								fs.readFileSync('./test/files/tmdbService/personFilmography.json').toString(),
	'https://api.themoviedb.org/3/person/4756?api_key=98deea9e9512d3124b9fe528f476c51d':
								fs.readFileSync('./test/files/tmdbService/personDetails.json').toString()
}

const movie = require('../domain/service/tmdbService')(reqToFile)

function reqToFile(path, cb) {
	const data = endPoints[path]
	if(!data) return cb(new Error('No mock file for path ' + path))
	cb(null,{
		statusCode : 200
	},data)
}

module.exports = {
	testGetMovieSearch,
	testGetMovieDetails,
	testGetActorDetails
}

function testGetMovieSearch(test) {
	movie.getMovieList('war games', 1,(err, list) => {
		if(err)
			test.ifError(err)
		else {
			test.equal(list.results.length, '6')
			test.equal(list.results[0].title, 'War Games: The Dead Code')
			test.equal(list.results[0].id, '14154')
		}
		test.done()
	})
}

function testGetMovieDetails(test) {
	movie.getMovieDetails('860', (err, obj) => {
		if(err)
			test.ifError(err)
		else {
			test.equal(obj.id, '860')
			test.equal(obj.originalTitle, 'WarGames')
			test.equal(obj.releaseDate, '1983-06-03')
			test.equal(obj.cast[0].name,'Matthew Broderick')
		}
		test.done()
	})
}

function testGetActorDetails(test) {
	movie.getActorDetails('4756', (err, obj) => {
		if(err)
			test.ifError(err)
		else {
			test.equal(obj.name, 'Matthew Broderick')
			test.equal(obj.id, '4756')
			test.equal(obj.birthday, '1962-03-21')
			test.equal(obj.filmography[0].title, 'Inspector Gadget')
			test.equal(obj.filmography[0].voteAverage, '4.3')
		}
		test.done()
	})
}