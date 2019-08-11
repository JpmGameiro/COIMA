'use strict'

const path = require('path')

/**
 * Configures partials and various helpers for handlbars object, used as a view template
 * @param hbs - handlebars object
 */
module.exports = function configureHbs(hbs) {

	hbs.registerPartials(path.join(__dirname, '../../views/partials'))


	/**
	 * Helper for pagination functionality, limit the content of each page
	 */
	hbs.registerHelper('paginate', function(query, currentPage, totalPages, size, options) {
		let startPage, endPage, context
		let nameSearched = query

		startPage = currentPage - Math.floor(size / 2)
		endPage = currentPage + Math.floor(size / 2)

		if (startPage <= 0) {
			endPage -= (startPage - 1)
			startPage = 1
		}

		if (endPage > totalPages) {
			endPage = totalPages
			if (endPage - size + 1 > 0) {
				startPage = endPage - size + 1
			} else {
				startPage = 1
			}
		}

		context = {
			name : nameSearched,
			isFirstPage: false,
			pages: [],
			isLastPage: false,
			lastPage : totalPages
		}
		if (startPage === 1) {
			context.isFirstPage = true
		}
		for (let i = startPage; i <= endPage; i++) {
			context.pages.push({
				page: i,
				isCurrent: i === currentPage,
			})
		}
		if (endPage === totalPages) {
			context.isLastPage = true
		}
		return new hbs.SafeString(options.fn(context))
	})

	/**
	 * Helper used to check if certain movie already exists in the given set of movies that belong to a user list
	 */
	hbs.registerHelper('checkIfExists', function (items, movieID, options) {
		const context = {  }
		context.exists = items.some(item=>parseInt(item.movieId)===movieID)
		return new hbs.SafeString(options.fn(context))
	})

    /**
	 * Helper used to check if the list protection is public or private in order to present editing options or not
     */
	hbs.registerHelper('checkUserList', function (username, listProtection, owner, options) {
		const context = []
		context.isMine = username === owner
		context.private = listProtection !== 'public'
		return new hbs.SafeString(options.fn(context))
	})

}