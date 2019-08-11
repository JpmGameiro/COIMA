'use strict'

function addMovieToList(movieID, listID, username) {
	const data =
		`movieID=${movieID}`
	const uri = `/users/${username}/lists/${listID}`
	httpRequest('POST', uri, data, (err) => {
		if (err) return alert(err)
		let divToRemove = document.getElementById(`addFilm-${listID}`)
		let mainDiv = document.getElementById(`mainDiv-${listID}`)
		mainDiv.removeChild(divToRemove)
		let divToAdd = document.createElement('div')
		divToAdd.setAttribute('id', `removeFilm-${listID}`)
		divToAdd.className += 'divRemoveFilm'
		const html =
			`<button onclick="removeMovieFromList('${movieID}','${listID}','${username}')" class="removeToList">-</button>`
		divToAdd.innerHTML = html
		mainDiv.appendChild(divToAdd)
	})
}

function removeMovieFromList(movieID, listID, username) {
	const data =
		`movieID=${movieID}`
	const uri = `/users/${username}/lists/${listID}`
	httpRequest('DELETE', uri, data, (err) => {
		if (err) return alert(err)
		let divToRemove = document.getElementById(`removeFilm-${listID}`)
		let mainDiv = document.getElementById(`mainDiv-${listID}`)
		mainDiv.removeChild(divToRemove)
		let divToAdd = document.createElement('div')
		divToAdd.setAttribute('id', `addFilm-${listID}`)
		divToAdd.className += 'divRemoveFilm'
		const html =
			`<button onclick="addMovieToList('${movieID}','${listID}','${username}')" class="addToList">+</button>`
		divToAdd.innerHTML = html
		mainDiv.appendChild(divToAdd)
	})
}