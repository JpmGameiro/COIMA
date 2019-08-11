'use strict'

/**
 * Actor object
 * @param {string} biography
 * @param {string} birthday - format YY-MM-DD
 * @param {string} deathday - format YY-MM-DD
 * @param {number} id
 * @param {string} name
 * @param {number} popularity
 * @param {string} portrait - path to profile picture
 * @constructor
 */
function Actor(biography, birthday, deathday, id, name, popularity, portrait) {
	this.name = name
	this.id = id
	this.biography = biography
	this.birthday = birthday
	this.deathday = deathday
	this.popularity = popularity
	this.portrait = portrait
	this.filmography=[]
	this.toString = function () {
		return `Name:${name} , Id:${id} , biography: ${biography}, birthday: ${birthday}, deathday: ${deathday}, popularity ${popularity}, portrait ${portrait}`
	}
}

module.exports = Actor