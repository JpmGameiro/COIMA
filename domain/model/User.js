'use strict'

/**
 * User object
 * @param {string} username
 * @param {string} password
 * @param {string} fullName
 * @param {string} email
 * @param {Array<string>} lists - array of list ids created by user
 * @param {Array<number>} commentedOn -
 * @param {string} rev - revision of user in CouchDb
 * @constructor
 */
function User(username, password, fullName, email, lists, commentedOn, rev) {
	this.username = username
	this.password = password
	this.fullName = fullName
	this.email = email
	this.lists = lists
	this.commentedOn = commentedOn
	this._rev = rev
}

module.exports = User