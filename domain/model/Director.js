'use strict'

/**
 * Director object
 * @param {string} name
 * @param {number} id
 * @param {string} portrait - path to profile picture
 * @constructor
 */
function Director(name, id, portrait) {
	this.name = name
	this.id = id
	this.portrait = portrait
	this.toString = function () {
		return `Name:${name} , Id:${id} , Portrait: ${portrait}`
	}
}

module.exports = Director