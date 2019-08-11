'use strict'

/**
 * Cast member object
 * @param {string} name
 * @param {number} id
 * @param {string} character
 * @param {string} portrait - path to profile picture
 * @constructor
 */
function CastMember(name, id, character, portrait) {
	this.name = name
	this.id = id
	this.character = character
	this.portrait = portrait
	this.toString = function () {
		return `Name:${name} , Id:${id} , Character: ${character}`
	}
}

module.exports = CastMember