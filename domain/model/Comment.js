'use strict'

/**
 * Represents a comment any movie in the TMDb API
 * @param {number} id
 * @param {number} movieId
 * @param {string} movieName
 * @param {string} author
 * @param {string} text - user's actual comment
 * @param {Array<Comment>} replies - array containing replies to this comment (represented by other Comment objects)
 * @constructor
 */
function Comment(id, movieId, movieName, author, text, replies) {
	this.id = id
	this.movieId = movieId
	this.movieName = movieName
	this.author = author
	this.text = text
	this.replies = replies
}

module.exports = Comment