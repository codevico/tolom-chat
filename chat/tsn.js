// CLIENT

import '/socket.io/socket.io.js'

const messagesDiv = document.querySelector('.messages')
const usersDiv = document.querySelector('.users')
const inputMessage = document.querySelector('.input-message')
const buttonSend = document.querySelector('.button-send')

let username = localStorage.getItem('username')
let color = localStorage.getItem('color')

const setUserName = (value) => {
    if (value) {
        username = value
        localStorage.setItem('username', value)
    } else {
        username = 'unnamed'
        localStorage.removeItem('username')
    }
}

const setColor = (value) => {
    if (value) {
        color = value
        localStorage.setItem('color', value)
    } else {
        color = null
        localStorage.removeItem('color')
    }
}

const refreshUsers = (users) => {
    usersDiv.innerHTML = ''
    for (const user of users) {
        const row = usersDiv.appendChild(document.createElement('div'))
        row.textContent = user.username
        if (user.color) row.style.color = user.color
        row.style.cursor = 'pointer'
        row.addEventListener('click', () => {
            inputMessage.value = `/whisper ${user.username?.includes(' ') ? `"${user.username}"` : user.username} `
            inputMessage.focus()
        })
    }
}

const sendMessage = () => {
    const text = inputMessage.value?.trim()
    inputMessage.value = ''
    if (text === '') return
    socket.emit('message', { text })
}

const printMessage = ({ from, text, html, color, textColor }) => {
    const msgDate = messagesDiv.appendChild(document.createElement('div'))
    msgDate.classList.add('message-date')
    const date = new Date()
    msgDate.textContent = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    const msgFrom = messagesDiv.appendChild(document.createElement('div'))
    msgFrom.classList.add('message-from')
    msgFrom.textContent = from || ''
    msgFrom.style.color = color
    const msgText = messagesDiv.appendChild(document.createElement('div'))
    msgText.classList.add('message-text')
    if (html) msgText.innerHTML = html
    else msgText.textContent = text
    if (textColor) msgText.style.color = textColor
    messagesDiv.scrollTop = messagesDiv.scrollHeight
}

printMessage({ isSystem: true, text: 'Welcome to TSN Messenger. Type /help for commands.' })

const socket = io('/tsn')

socket.on('connect', () => {
    if (!username) {
        const input = prompt('Username')
        setUserName(input)
    }
    socket.emit('login', { username: username || 'unnamed', color: color })
})

socket.on('disconnect', () => {
    setTimeout(() => {
        printMessage({ isSystem: true, text: 'lost connection to the server. attempting to reconnect...'})
    }, 1000)
})

socket.on('users', (users) => {
    refreshUsers(users)
})

socket.on('userInfo', ({username, color}) => {
    setUserName(username)
    setColor(color)
})

socket.on('message', ({ from, text, html, color, textColor, isSystem }) => {
    printMessage({ from, text, html, color, textColor, isSystem })
})

buttonSend.addEventListener('click', sendMessage)

inputMessage.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault()
        sendMessage()
    }
})
