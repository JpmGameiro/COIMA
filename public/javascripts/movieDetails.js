'use strict'

// by default "cast" tab is opened
let currentTab = 'Cast'
let commentTree = null
let currCommentChain = 0
const COLOR1 = 'FFFFFF'
const COLOR2 = 'EBEBEB'

window.onscroll = function() {
	if( (window.innerHeight + window.scrollY) >= document.body.offsetHeight ) {
		if( document.getElementById('Comments').className === 'tab-content--highlight' ) {
			if( currCommentChain < commentTree.length ) {
				genCommentsHtml(
					commentTree[++currCommentChain],
					document.querySelector('.nested-comments'),
					COLOR1
				)
			}
		}
	}
}

window.onload = function() {
	addEventListenerToTabs()
	if( document.getElementById('commentform') !== null )
		addClickListenerToForm()
	fetchComments()
}

function addEventListenerToTabs() {
	const children = document.querySelectorAll('.tab-list__tab-btn')
	if( children === null )
		return
	for( let i = 0; i < children.length; ++i ) {
		children[i].addEventListener('click', e => {
			e.preventDefault()
			selectTab(e, e.currentTarget.textContent)
		})
	}
}

function selectTab(e, newTab) {
	// if it's the same tab, do nothing
	if( newTab === currentTab )
		return

	// hide previous tab's content
	document.getElementById(currentTab).className = 'tab-content--hide'

	// Get all elements with class="tablinks" and remove the class "active"
	const tabs = document.querySelectorAll('.tab-list__tab-btn')
	for( let i = 0; i < tabs.length; ++i )
		tabs[i].classList.remove('active')

	// Show the current tab, and add an "active" class to the button that opened the tab
	document.getElementById(newTab).className = 'tab-content--highlight'
	e.currentTarget.classList.add('active')

	// update current tab
	currentTab = newTab
}

function addClickListenerToForm() {
	document
		.getElementById('commentform')
		.addEventListener('submit', function(e) {
			e.preventDefault()

			const path = window.location.pathname.replace('movies', 'comments')
			const movieName = document.getElementById('pfont-size').firstElementChild.textContent
			const data = `text=${this[0].value}&movieName=${movieName}`
			httpRequest('POST', path, data, (err, data) => {
				if( err ) return alert('Comment failed!!')
				const ul = document.querySelector('.nested-comments')

				const li = genLiComment(
					COLOR1,
					{
						author: data.author,
						text: data.text,
						id: data.id
					}
				)
				ul.insertBefore(li, ul.firstChild)
			})

			this[0].value = ''
		})
}

function fetchComments() {
	const path = window.location.pathname.replace('movies', 'comments')
	httpRequest('GET', path, null, (err, comments) => {
		if( err ) return alert('Impossible to load comments!!')
		commentTree = comments
		//print first comment chain
		genCommentsHtml(
			commentTree[currCommentChain],
			document.querySelector('.nested-comments'),
			COLOR1
		)
	})
}

function genCommentsHtml(comment, ul, color) {
	const li = genLiComment(color, comment)
	ul.appendChild(li)

	if( comment.replies.length !== 0 )
		genRepliesHtml(comment.replies, li.children[1], COLOR2)
}

function genRepliesHtml(replies, ul, color) {
	for( let i = 0; i < replies.length; ++i ) {
		const li = genLiComment(color, replies[i])
		ul.appendChild(li)

		if( replies[i].replies.length !== 0 )
			genRepliesHtml(replies[i].replies, li.children[1], color === COLOR1 ? COLOR2 : COLOR1)
	}
}

function genLiComment(color, comment) {
	const li = document.createElement('li')
	li.className = 'nested-comments__comment-chain'
	li.style.cssText = `background-color: #${color};`
	li.id = 'comment-' + comment.id

	const commentDiv = document.createElement('div')
	commentDiv.className = 'nested-comments__comment-chain__comment'
	const h5Author = document.createElement('h5')
	h5Author.textContent = comment.author
	commentDiv.appendChild(h5Author)
	const pText = document.createElement('p')
	pText.textContent = comment.text
	commentDiv.appendChild(pText)
	if( document.getElementById('commentform') !== null ) {
		const aReply = createReplyForm(comment.id)
		commentDiv.appendChild(aReply)
	}
	li.appendChild(commentDiv)

	const repliesUl = document.createElement('ul')
	repliesUl.className = 'nested-comments'
	li.appendChild(repliesUl)

	return li
}

function createReplyForm(id) {
	const aReply = document.createElement('a')
	aReply.textContent = 'Reply'
	aReply.setAttribute('href', '#comment-' + id)

	aReply.addEventListener('click', function(e) {
		e.preventDefault()
		const formId = 'form-' + id

		if( document.getElementById(formId) )
			return


		const form = document.getElementById('commentform').cloneNode(true)
		form.id = formId
		form.addEventListener('submit', sendReplyClickListener)
		form[0].setAttribute('form', form.id)
		form[1].setAttribute('form', form.id)
		form[2].classList.remove('d-none')
		form[2].addEventListener('click', cancelReplyClickListener)
		this.parentElement.insertAdjacentElement('afterend', form)
	})
	return aReply
}

function sendReplyClickListener(e) {
	e.preventDefault()

	const ul = this.nextElementSibling
	const currColor = this.parentElement.style.cssText
	const path = window.location.pathname.replace('movies', 'comments')
	const movieName = document.getElementById('pfont-size').firstElementChild.textContent
	const data = `text=${e.currentTarget[0].value}&idToReply=${this.id.substring(5)}&movieName=${movieName}`
	httpRequest('POST', path, data, (err, data) => {
		if( err ) return 0

		const li = genLiComment(
			currColor === 'background-color: rgb(255, 255, 255);' ? COLOR2 : COLOR1,
			{
				author: data.author,
				text: data.text,
				id: data.id
			}
		)
		ul.insertBefore(li, ul.firstChild)
	})
	this.remove()
}

function cancelReplyClickListener(e) {
	e.preventDefault()

	this.parentElement.parentElement.remove()
}