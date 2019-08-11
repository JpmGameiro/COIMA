'use strict'

/**
 *	Movie object
 * @param {string} tagline
 * @param {number} id
 * @param {string} originalTitle
 * @param {string} overview
 * @param {string} releaseDate - format YY-MM-DD
 * @param {number} voteAverage
 * @param {string} poster - path to {} poster
 * @param {Array<string>} genres
 * @constructor
 */
function Movie(tagline, id, originalTitle, overview, releaseDate, voteAverage, poster, genres) {
	this.tagline = tagline
	this.id = id
	this.originalTitle = originalTitle
	this.overview = overview
	this.releaseDate = releaseDate
	this.voteAverage = voteAverage
	this.poster = poster
	this.genres = genres
	this.directors = []
	this.cast = []
	this.toString = function () {
		return `Tagline:${tagline} , Id:${id} , OriginalTitle:${originalTitle} , Overview:${overview} , ReleaseDate: ${releaseDate} , VoteAverage: ${voteAverage}, Poster: ${poster}`
	}
}

module.exports = Movie