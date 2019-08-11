'use strict'

function httpRequest(method, path, data, cb) {
	const xhr = new XMLHttpRequest()
	xhr.open(method, path, true)

	if( method === 'POST' || method === 'PUT' || method === 'DELETE' )
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')

	xhr.responseType = 'json'

	xhr.onreadystatechange = function() {//Call a function when the state changes.
		if( xhr.readyState === XMLHttpRequest.DONE ) {
			if( xhr.status === 200 || xhr.status === 201 )
				cb(null, xhr.response)
			else
				cb(new Error(xhr.status + ': ' + xhr.statusText))
		}
	}
	xhr.send(data)
}