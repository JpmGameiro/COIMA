'use strict'

/**
 * Movie search result for one page
 * @param {string} query
 * @param {Array<MovieListItem>} results
 * @param {number} currentPage
 * @param {number} totalPages
 * @param {number} totalResults
 * @constructor
 */
function MovieList(query, results, currentPage, totalPages, totalResults) {
	this.query = query
	this.results = results
	this.currentPage = currentPage
	this.totalPages = totalPages
	this.totalResults = totalResults
}

module.exports = MovieList