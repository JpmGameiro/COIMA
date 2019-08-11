'use strict'

const express = require('express')
const listService = require('../domain/service/userListService')()
const commentService = require('../domain/service/commentService')()
const sessionRestriction = require('./middlewares/sessionRestriction')
const userValidation = require('./middlewares/userValidation')
const router = express.Router()

/**
 * Restricts access to this route to only signed in users
 */
router.use(sessionRestriction)

/**
 * Shows user profile page
 */
router.get('/:username',
    userValidation,
    function (req, res, next) {
        res.render('userInfo')
    })

/**
 * Shows all public lists
 */
router.get('/public/lists',
    sessionRestriction,
    function (req, res, next) {
        let page = req.query['page']
        if (!page) page = '1'
        listService.getPublicLists(page, (err, data) => {
            if (err) return next(err)
            let totalPages = Math.ceil(data.rows / 4)
            res.render('userLists', {
                public: true,
                lists: data.lists,
                currentPage: parseInt(page),
                totalPages: totalPages
            })
        })
    })

/**
 * Shows lists of a user
 */
router.get('/:username/lists',
    function (req, res, next) {
        let page = req.query['page']
        if (!page) page = '1'
        if(req.user.username !== req.params.username) return res.render('error', {
            message: 'Forbidden - You do not have permission to access this lists',
            statusCode: 403
        })
        listService.getListsByUserPaginated(req.params.username, page, (err, data) => {
            if (err) return next(err)
            let totalPages = Math.ceil(req.user.lists.length / 4)
            res.render('userLists', {lists: data.lists, currentPage: parseInt(page), totalPages: totalPages})
        })
    })

/**
 * Shows form to create a new list
 */
router.get('/:username/lists/new', function (req, res) {
    res.render('createNewList')
})

/**
 * Adds newly created list to user, redirects to user lists page
 */
router.post('/:username/lists/new', function (req, res, next) {
    listService.createList(req.body.name, req.body.option, req.body.description, req.user, (err) => {
        if (err) return next(err)
        res.redirect(`/users/${req.params.username}/lists`)
    })
})

/**
 * Shows specific list
 */
router.get('/:username/lists/:listId', function (req, res, next) {
    listService.getListById(req.params.listId, (err, data) => {
        if (err) return next(err)
        if (req.params.username !== data.owner) {
            const numberOfguests = data.guests.length
            let guest
            if (numberOfguests !== 0)
                guest = data.guests.find(guest => guest.username === req.params.username)
            if (data.listProtection === 'private' && guest === undefined)
                return res.render('error', {
                    message: 'Forbidden - You do not have permission to access this list',
                    statusCode: 403
                })
        }
        res.render('userSpecificList', data)
    })
})

/**
 * Adds a movie to a list
 */
router.post('/:username/lists/:listId', function (req, res, next) {
    listService.addMovieToList(
        req.params.listId,
        req.body.movieID,
        (err) => {
            if (err) return next(err)
            res.sendStatus(200)
        })
})

/**
 * Deletes a movie from specific list
 */
router.delete('/:username/lists/:listId', function (req, res, next) {
    listService.removeMovieFromList(
        req.params.listId,
        req.body.movieID,
        (err) => {
            if (err) return next(err)
            res.sendStatus(200)
        }
    )
})

/**
 * Deletes a list with the specified id
 */
router.delete('/:username/lists', function (req, res, next) {
    const listId = req.body.listID
    listService.deleteList(listId, req.user, err => {
        if (err) return next(err)
        res.sendStatus(200)
    })
})

/**
 * Updates name or description of a specific list
 */
router.put('/:username/lists/:listId', function (req, res, next) {
    const options = {
        listId: req.params.listId,
        name: req.body.name,
        description: req.body.description,
        username: req.params.username,
        listProtection: req.body.listProtection
    }
    listService.updateList(options,
        (err) => {
            if (err) return next(err)
            res.sendStatus(200)
        }
    )
})

/**
 * Invites an user to a list
 */
router.put('/:username/lists/:listId/invite', function (req, res, next) {
    listService.inviteUser(req.body.guestUsername, req.body.permission, req.params.listId,
        (err, info) => {
            if (err) return next(err)
            if (info) {
                return res.status(info.status).send(info.message)
            }
            res.sendStatus(200)
        })
})

/**
 * Get comments written by a user
 */
router.get('/:username/comments',
    userValidation,
    function (req, res, next) {
        commentService.getCommentsByUser(req.user.username, req.user.commentedOn, (err, comments) => {
            if (err) return next(err)
            res.render('userComments', {comments: comments})
        })
    })

module.exports = router
