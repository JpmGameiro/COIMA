function removeList(listId, username) {
    const path = `/users/${username}/lists`
    const data = `listID=${listId}`
    httpRequest('DELETE', path, data, err => {
        if (err) return alert(err.message)
        const mainDiv = document.getElementById('mainDiv')
        const divToRemove = document.getElementById(`list-${listId}`)
        mainDiv.removeChild(divToRemove)
    })
}

function showELPopUp(id) {
    document.getElementById(`editListPopUp-${id}`).style.visibility = 'visible'
}

function hideELPopUp(id) {
    document.getElementById(`editListPopUp-${id}`).style.visibility = 'hidden'
}

function editList(listId, username) {
    const path = `/users/${username}/lists/${listId}`
    const inputName = document.getElementById(`name-${listId}`)
    const inputDescription = document.getElementById(`description-${listId}`)
    const optionEdit = document.getElementById(`optionEdit-${listId}`)

    let data = `name=${inputName.value}&description=${inputDescription.value}`
    let protectionChanged = false
    if (optionEdit.checked === true) {
        data = data + `&listProtection=${optionEdit.value}`
        protectionChanged = true
    }
    httpRequest('PUT', path, data, (err) => {
        if (err) return alert(err.message)
        if (inputName.value !== '') {
            document
                .getElementById(`listName-${listId}`)
                .innerHTML = `<a class="card-title" href="/users/${username}/lists/${listId}">
                <span id="themeColor">${inputName.value}</span>
                </a>`
        }
        inputName.value = ''
        inputDescription.value = ''
        if (protectionChanged) {
            const labelProtection = document.getElementById(`protection-${listId}`)
            const mainDiv = document.getElementById(`divProtection-${listId}`)
            const itemsList = document.getElementById(`itemsList-${listId}`)
            let text = 'Public'
            let value = 'public'
            mainDiv.removeChild(labelProtection)

            if (optionEdit.value === 'public'){
                text = 'Private'
                value = 'private'
                const addUserBtn = document.getElementById(`inviteUserBtn-${listId}`)
                itemsList.removeChild(addUserBtn)
            } else {
                const addUserBtn = document.createElement('button')
                addUserBtn.setAttribute('class', 'inviteUser')
                addUserBtn.id = `inviteUserBtn-${listId}`
                addUserBtn.addEventListener('click', () => showIUPopUp(`${listId}`))
                addUserBtn.innerHTML = `<span class="fa fa-user-plus"></span>`
                itemsList.appendChild(addUserBtn)
            }
            const elem = document.createElement('label')
            elem.setAttribute('class', "checkbox")
            elem.id = `protection-${listId}`
            elem.innerHTML = `<input type="checkbox" id="optionEdit-${listId}" value="${value}">${text}`
            mainDiv.appendChild(elem)
        }
        hideELPopUp(listId)
    })
}

function inviteUser(listId, username) {
    const path = `/users/${username}/lists/${listId}/invite`
    const guestUsername = document.getElementById(`guestUsername-${listId}`)
    let permission = document.getElementById(`optionInvite-${listId}`)
    if (permission.checked === false)
        permission = 'readonly'
    else permission = permission.value
    const data = `guestUsername=${guestUsername.value}&permission=${permission}`
    const mainDiv = document.getElementById(`inviteUserPopUp-${listId}`)

    const errorHtml = document.createElement('div')
    errorHtml.id = `error-${listId}`
    const strong = document.createElement('strong')
    const strongText = document.createTextNode('Warning! User doesn\'t exists!')
    strong.appendChild(strongText)
    errorHtml.className = 'alert alert-warning'
    errorHtml.setAttribute('role', 'alert')
    errorHtml.appendChild(strong)
    httpRequest('PUT', path, data, (err) => {
        if (err) {
            if (document.getElementById(`error-${listId}`) === null) {
                mainDiv.appendChild(errorHtml)
            }
        }
        else {
            if (document.getElementById(`error-${listId}`) !== null) {
                mainDiv.lastChild.remove()
            }
            guestUsername.value=''
            permission.value = ''
            hideIUPopUp(listId)
        }
    })
}

function showIUPopUp(id) {
    document.getElementById(`inviteUserPopUp-${id}`).style.visibility = 'visible'
}

function hideIUPopUp(id) {
    document.getElementById(`inviteUserPopUp-${id}`).style.visibility = 'hidden'
}
