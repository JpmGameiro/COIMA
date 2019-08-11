'use strict'

const global = require('../../global')
const mapper = require('../mapper')
const utils = require('./serviceUtils')
const debug = require('debug')('LI52D-G11:userListService')
const movieService = require('./tmdbService')()
const userService = require('./userService')()

const listsUrl = global.couchdb_url + '/lists/'
const usersUrl = global.couchdb_url + '/users/'

/**
 * Obtain data from provided dataSource and manages user movie list interaction with application
 * @param {function} dataSource - repository (local or a Web API)
 * @returns {{getListById: getListById, getListsByUserPaginated: getListsByUserPaginated, getListsByUser: getListsByUser, createList: createList, deleteList: deleteList, updateList: updateList, addMovieToList: addMovieToList, removeMovieFromList: removeMovieFromList}}
 */
function init(dataSource) {
    let req
    if (dataSource)
        req = dataSource
    else
        req = require('request')

    return {
        getListById,
        getListsByUserPaginated,
        getListsByUser,
        getPublicLists,
        createList,
        deleteList,
        updateList,
        addMovieToList,
        removeMovieFromList,
        inviteUser
    }

    /**
     * Get list with the id received in param
     * @param {string} listId
     * @param {function} cb(err, UserList)
     */
    function getListById(listId, cb) {
        debug('Fetching list with id = ' + listId)
        req(utils.optionsBuilder(listsUrl + listId), (err, res, body) => {
            if (err) return cb(err)
            if (res.statusCode === 404) return cb({message: 'List not found!', status: 404})
            const list = mapper.mapToUserList(body)
            cb(null, list)
        })
    }

    /**
     * Get paginated user lists according to the list ids received
     * @param {string} username
     * @param {int} page
     * @param {function} cb(err, Array<UserList>)
     */
    function getListsByUserPaginated(username, page, cb) {
        debug('Fetching lists of = ' + username)
        req(utils.optionsBuilder(usersUrl + username), (err, res, user) => {
            let br = utils.buildRange(page)
            const queryString = `_all_docs?include_docs=true&limit=${br.limit}&skip=${br.offset}`
            req(utils.optionsBuilder(listsUrl + queryString, 'POST', {keys: user.lists}),
                (err, res, data) => {
                    if (err) return cb(err)
                    if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
                    let lists = []
                    data.rows.forEach((item) => {
                        lists.push(mapper.mapToUserList(item.doc))
                    })
                    cb(null, {lists: lists, rows: data.rows.length})
                }
            )
        })
    }

    /**
     * Get all public lists
     * @param {int} page
     * @param {function} cb(err, Array)
     */
    function getPublicLists(page, cb) {
        debug('Fetching public lists')
        const br = utils.buildRange(page)
        req(utils.optionsBuilder(listsUrl + '_all_docs?include_docs=true'), (err, res, data) => {
            if (err) return cb(err)
            if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
            let publicLists = []
            data.rows.filter(item => item.doc.listProtection === 'public')
                .forEach((item) => publicLists.push(mapper.mapToUserList(item.doc)))
            const totalRows = publicLists.length
            publicLists = publicLists.slice(br.offset, br.limit * page)
            cb(null, {lists: publicLists, rows: totalRows})
        })
    }

    /**
     * Get user lists according to the list ids received
     * @param listIds
     * @param cb
     */
    function getListsByUser(listIds, cb) {
        debug('Fetching lists with these ids = ' + listIds)
        req(utils.optionsBuilder(listsUrl + '_all_docs?include_docs=true', 'POST', {keys: listIds}),
            (err, res, data) => {
                if (err) return cb(err)
                if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
                let lists = []
                data.rows.forEach((item) => {
                    lists.push(mapper.mapToUserList(item.doc))
                })
                cb(null, lists)
            }
        )
    }

    /**
     * Creates a list with the given parameters and adds its id to the array of ids of the given user
     * @param {string} listName
     * @param {string} listProtection
     * @param {string} listDesc
     * @param {User} user
     * @param {function} cb(err, UserList)
     */
    function createList(listName, listProtection, listDesc, user, cb) {
        debug(`Creating new list for user ${user.username} with name ${listName}`)
        const list = {
            listName,
            listProtection,
            listDesc,
            owner: user.username,
            items: [],
            guests: []
        }
        req(utils.optionsBuilder(listsUrl, 'POST', list), (err, res, data) => {
            if (err) return cb(err)
            if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
            user.lists.push(data.id)
            const list = mapper.mapToUserList({
                listName,
                listProtection,
                listDesc,
                owner: user.username,
                items: [],
                _rev: data.rev,
                _id: data.id
            })
            req(utils.optionsBuilder(usersUrl + user.username, 'PUT', user),
                (err, res) => {
                    if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
                    if (err) return cb(err)
                    cb(null, list)
                }
            )
        })
    }

    /**
     * Deletes list with the given id and removes it from the specified user's list array
     * @param {string} listId
     * @param {User} user
     * @param {function} cb(err) if successful, no parameters are passed to the callback
     */
    function deleteList(listId, user, cb) {
        debug('Deleting list with id = "' + listId + '" of user = ' + user.username)
        getListById(listId, (err, data) => {
            if (err) return cb(err)
            const list = data
            req(utils.optionsBuilder(listsUrl + listId + `?rev=${list._rev}`, 'DELETE'), (err, res) => {
                if (err) return cb(err)
                if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
                const idxToRemove = user.lists.findIndex(list => list === listId)
                user.lists.splice(idxToRemove, 1)
                userService.updateUser(user, (err) => {
                    if (err) return cb(err)
                    if (list.guests.length !== 0) {
                        let guests = list.guests.map(guest => guest.username)
                        userService.getUsers(guests, (err, data) => {
                            data = deleteListFromGuests(listId, data)
                            userService.updateUsers(data, (err) => {
                                if (err) return cb(err)
                                cb()
                            })
                        })
                    }
                    else cb()
                })
            })
        })
    }

    /**
     * Update specific user list of movies
     * @param {object} options object with the properties which are to update
     * @param {function} cb(err) if successful, no parameters are passed to the callback
     */
    function updateList(options, cb) {
        debug('Updating list with id = "' + options.listId + '" of user = ' + options.username)
        req(utils.optionsBuilder(listsUrl + options.listId), (err, res, data) => {
            if (err) return cb(err)
            if (res.statusCode === 404) return cb({message: 'List not found!', status: res.statusCode})
            let list = mapper.mapToUserList(data)
            let guests = data.guests.map(guest => guest.username)
            userService.getUsers(guests, (err, users) => {
                if (err) return cb(err)
                list = populateList(list, options, users)
                req(utils.optionsBuilder(listsUrl + list.id, 'PUT', list), (err, res) => {
                    if (err) return cb(err)
                    if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
                    userService.updateUsers(users, (err) => {
                        if (err) return cb(err)
                        cb()
                    })
                })
            })
        })
    }

    /**
     * Auxiliar method to populate list
     * @param {UserList} list
     * @param {object} options
     */
    function populateList(list, options, users) {
        if (options.name !== '' && options.name !== undefined)
            list.listName = options.name
        if (options.description !== '' && options.description !== undefined) {
            list.listDesc = options.description
        }
        if (options.listProtection) {
            if (options.listProtection === 'public') {
                deleteListFromGuests(list.id, users)
                list.guests = []
            }
            list.listProtection = options.listProtection
        }
        return list
    }

    function deleteListFromGuests(listId, guests) {
        guests.forEach(item => {
            const idxToRemove = item.lists.findIndex(list => list === listId)
            item.lists.splice(idxToRemove, 1)
        })
        return guests
    }

    /**
     * Adds user to a specific list with the given permission
     * @param username
     * @param permission
     * @param listId
     * @param cb
     */
    function inviteUser(username, permission, listId, cb) {
        userService.findById(username, (err, user, info) => {
            if (err) return cb(err)
            if (info) return cb(null, {message: info, status: 404})
            req(utils.optionsBuilder(listsUrl + listId), (err, res, data) => {
                if (err) return cb(err)
                if (res.statusCode === 404) return cb(null, {message: 'List not found!', status: res.statusCode})
                let newList = mapper.mapToUserList(data)
                const index = newList.guests.findIndex(guest => guest.username === username)
                if (index === -1) {
                    newList.guests.push({username: username, permission: permission})
                }
                else if (newList.guests[index].permission !== permission) {
                    newList.guests[index].permission = permission
                }
                req(utils.optionsBuilder(listsUrl + listId, 'PUT', newList), (err, res) => {
                    if (err) return cb(err)
                    if (res.statusCode > 400) return cb(null, {message: 'Error updating List!', status: res.statusCode})
                    user.lists.push(listId)
                    req(utils.optionsBuilder(usersUrl + username, 'PUT', user), (err, res) => {
                        if (err) return cb(err)
                        if (res.statusCode > 400) return cb(null, {
                            message: 'Error updating User!',
                            status: res.statusCode
                        })
                        cb()
                    })
                })
            })
        })
    }

    /**
     * Add specific movie to list with id received in param
     * @param {string} listId
     * @param {string} movieId
     * @param {function} cb(err) if successful, no parameters are passed to the callback
     */
    function addMovieToList(listId, movieId, cb) {
        debug(`Adding movie with id = ${movieId} to list with id = ${listId}`)
        movieService.getMovieDetails(movieId, (err, movie) => {
            let moviePoster = movie.poster
            let movieRating = movie.voteAverage
            if (err) return cb(err)
            req(utils.optionsBuilder(listsUrl + listId), (err, res, data) => {
                if (err) cb(err)
                if (res.statusCode === 404) return cb({message: 'List not found!', status: res.statusCode})
                data.items.push({movieId, moviePoster, movieRating})
                req(utils.optionsBuilder(listsUrl + listId, 'PUT', data), (err, res) => {
                    if (err) return cb(err)
                    if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
                    cb()
                })
            })
        })
    }

    /**
     * Remove specified movie from list with id received in param
     * @param {string} listId
     * @param {string} movieId
     * @param {function} cb(err) if successful, no parameters are passed to the callback
     */
    function removeMovieFromList(listId, movieId, cb) {
        debug(`Removing movie with id = ${movieId} from list with id = ${listId}`)
        req(utils.optionsBuilder(listsUrl + listId), (err, res, data) => {
            if (err) cb(err)
            if (res.statusCode === 404) return cb({message: 'List not found!', status: res.statusCode})
            const idxToRemove = data.items.findIndex(item => item.movieId === movieId)
            data.items.splice(idxToRemove, 1)
            req(utils.optionsBuilder(listsUrl + listId, 'PUT', data),
                (err, res) => {
                    if (err) return cb(err)
                    if (res.statusCode > 400) return cb({message: 'Something broke!', status: res.statusCode})
                    cb()
                }
            )
        })
    }
}

module.exports = init