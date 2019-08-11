'use strict'

/**
 * Element of MovieList results array
 * @param {string} title
 * @param {number} id
 * @param {string} releaseDate - format YY-MM-DD
 * @param {string} poster - path to poster
 * @param {number} voteAverage
 * @constructor
 */
function MovieListItem(title, id, releaseDate, poster, voteAverage) {
	this.title = title
	this.id = id
	this.releaseDate = releaseDate
	this.poster = poster
	this.voteAverage = voteAverage
	this.toString = function () {
		return `Title:${title} , Id:${id} , ReleaseDate: ${releaseDate} , Poster: ${poster}`
	}
}

module.exports = MovieListItem