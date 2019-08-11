'use strict'

function removeMovie(movieId, listId, username) {
	const path = `/users/${username}/lists/${listId}`
	const data = `movieID=${movieId}`
	httpRequest('DELETE', path, data, err => {
		if (err) return alert(err.message)
		const mainDiv = document.getElementById('mainDiv')
		const divToRemove = document.getElementById(`movieID-${movieId}`)
		mainDiv.removeChild(divToRemove)
	})
}