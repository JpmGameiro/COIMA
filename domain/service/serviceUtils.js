'use strict'

/**
 * Utility functions used in various services
 */

const shortId = require('shortid')

/**
 * id generator used for comment ids
 */
function generateId() {
	return shortId.generate()
}

/**
 * Returns true or false if the id is valid or not
 * @param id
 * @returns boolean
 */
function validateId(id) {
	return shortId.isValid(id)
}

/**
 * Builds a range
 * @param page
 */
function buildRange(page) {
    this.offset = (page - 1) * 4
    this.limit = 4
    return {offset: this.offset, limit: this.limit}
}

/**
 * Generic options object to provide to an http request, containing its method, uri and request body
 * The parameters must be provided in the following order: URI, METHOD, BODY.
 * Only URI is obligatory, the rest can be omitted.
 *
 * By default, the object returned is:
 * { method: 'GET', json: true, uri: @param uri }
 * @returns {Object} json object containing info for an HTTP Request
 */
function optionsBuilder() {
	const argNames = ['uri', 'method', 'body']
	let res = {
		method: 'GET',
		json: true
	}
	for( let i = 0; i < arguments.length; ++i )
		res[argNames[i]] = arguments[i]
	return res
}

/**
 * Processes asynchronous functions in parallel
 * @param {Array} tasks - an array of functions to be executed
 * @param {function} callback (err,[functionResponse])
 */
function parallel(tasks, callback) {
	let responses = []
	let errOccured = false
	let tasksFulfilled = 0
	tasks.forEach((request, i) => {
		request((err, data) => {
			if (errOccured) return
			if (err) {
				errOccured = true
				return callback(err)
			}
			responses[i] = data
			++tasksFulfilled
			if ( tasksFulfilled === tasks.length ) {
				callback(null, responses)
			}
		})
	})
}

module.exports = {
	optionsBuilder,
	parallel,
	generateId,
	validateId,
    buildRange
}