'use strict'

const fs = require('fs')

const listService = require('../domain/service/userListService')(reqToFile)
const User = require('../domain/model/User')
const List = require('../domain/model/UserList')

const endpoints = {
	DELETE: {
		'http://127.0.0.1:5984/lists/123?rev=123123': fs.readFileSync('./test/files/userListService/deleteListResp.json').toString()
	},
	POST: {
		'http://127.0.0.1:5984/lists/_all_docs?include_docs=true': fs.readFileSync('./test/files/userListService/getListsByUser.json').toString(),
		'http://127.0.0.1:5984/lists/': fs.readFileSync('./test/files/userListService/createListResp.json').toString()
	},
	PUT: {
		'http://127.0.0.1:5984/users/bruno': fs.readFileSync('./test/files/userListService/putListInUserResp.json').toString(),
		'http://127.0.0.1:5984/lists/123': fs.readFileSync('./test/files/userListService/addMovieToList.json').toString(),
		'http://127.0.0.1:5984/lists/124': fs.readFileSync('./test/files/userListService/removeMovieFromList.json').toString()
	},
	GET: {
		'http://127.0.0.1:5984/lists/123': fs.readFileSync('./test/files/userListService/getListWithNoMoviesResp.json').toString(),
		'http://127.0.0.1:5984/lists/124': fs.readFileSync('./test/files/userListService/getListWithMoviesResp.json').toString(),
	},
    'https://api.themoviedb.org/3/movie/860?api_key=98deea9e9512d3124b9fe528f476c51d':
        fs.readFileSync('./test/files/tmdbService/wargamesDetails.json').toString()
}

function reqToFile(options, cb) {
	let data = endpoints[options.method][options.uri]
	if( !data ) return cb(new Error(`No mock file for ${options.method} ${options.uri}`))
	data = JSON.parse(data)
	cb(null, data.res, data.body)
}

function testCreateList(test) {
	const user = new User('bruno', 'test', 'Bruno Filipe', 'bruno@email.com', [], [], 111)
	listService.createList('Italian Movies', 'The best out there', user, (err, list) => {
		if( err )
			test.ifError(err)
		else {
			test.equal(list.listDesc, 'The best out there')
			test.equal(list.id, 123)
			test.equal(list.items.length, 0)
			test.equal(list.listName, 'Italian Movies')
			test.equal(list._rev, 123123)
		}
		test.done()
	})
}

function testGetListById(test) {
	listService.getListById(123, 'nuno', (err, list) => {
		if( err )
			test.ifError(err)
		else {
			test.equal(list.id, '123')
			test.equal(list.listName, 'Italian Movies')
			test.equal(list.listDesc, 'The best out there')
			test.equal(list.items.length, 0)
			test.equal(list._rev, '123123')
		}
		test.done()
	})
}

function testGetListsByUser(test) {
	listService.getListsByUser(['4a5cd144a1789249096663c6f000196d', '4a5cd144a1789249096663c6f00020a4'], (err, lists) => {
		if( err )
			test.ifError(err)
		else {
			test.equal(lists[0].id, '4a5cd144a1789249096663c6f000196d')
			test.equal(lists[0].items.length, undefined)
			test.equal(lists[1].id, '4a5cd144a1789249096663c6f00020a4')
			test.equal(lists[1].items[0].movieId, '348')
		}
		test.done()
	})
}

function testAddMovieToList(test) {
	listService.addMovieToList(123, 860, (err) => {
		if( err )
			test.ifError(err)
		test.done()
	})
}

function testDeleteList(test) {
	const list = new List('Italian Movies', 'The best out there', 'bruno', [], 123123, 123)
	const user = new User('bruno', 'test', 'Bruno Filipe', 'bruno@email.com', [list.id], [], 111)
	listService.deleteList(123, user, (err) => {
		if( err )
			test.ifError(err)
		test.equal(user.lists.length, 0)
		test.done()
	})
}

function testRemoveMovieFromList(test) {
	listService.removeMovieFromList(124, "348", (err) => {
		if( err )
			test.ifError(err)
		test.done()
	})
}

module.exports = {
	testCreateList,
	testGetListById,
	testGetListsByUser,
	testAddMovieToList,
	testDeleteList,
	testRemoveMovieFromList
}