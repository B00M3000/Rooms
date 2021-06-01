var messages = document.getElementById('messages')
var _messages = document.getElementById('_messages')
var users = document.getElementById('users')
var form = document.getElementById('form')
var text = document.getElementById('text')
var toggleSnap = document.getElementById('toggleSnap')

var snapping = true;

var socket = io.connect("", {
  query: {
    "SESSION_ID": SESSION_ID,
    "ROOM": room
  }
})

let USERNAME = null
socket.on('username', u => USERNAME = u)

socket.on('userJoin', data => {
  let m = document.createElement('li')
  m.append(`System: ${data.user} joined!`)
  messages.append(m)
  socket.emit('getUsers')
})

socket.on('userLeft', data => {
  let m = document.createElement('li')
  m.append(`System: ${data.user} left!`)
  messages.append(m)
  socket.emit('getUsers')
})

socket.on(`message`, message => {
  let m = document.createElement('li')
  
  let parsedMessage = urlify(message.content)

  if(message.type == "user"){
    m.innerHTML = `${message.author}: ${parsedMessage}`
  }
  
  messages.append(m)
  
  if(snapping){
    _messages.scrollTop = _messages.scrollHeight;
  }
})

socket.on('users', usersArray => {
  users.innerHTML = ""
  usersArray.forEach(c => {
    let li = document.createElement('li')
    let img = document.createElement('img')
    img.src = `/user/avatar?uid=${c.uid}`
    img.onerror="this.src='this.src='/images/default-user-icon.jpg'"
    li.append(img)
    li.append(c.username)
    users.append(li)
  })
})

text.addEventListener('input', e => {
   socket.emit('isTyping', text.value ? true : false)
})

let isTypingIndicator = document.querySelector('#isTypingIndicator')
let typing = []
socket.on('userTyping', data => {
  if(data.username == USERNAME) return
  if(data.isTyping){
    if(!typing.includes(data.username)) typing.push(data.username)
  } else {
    typing = typing.filter(t => t != data.username)
  }
  
  if(!typing) return isTypingIndicator.innerHTML = ""
  
  let finalString = " is typing..."
  for(t of typing){
    finalString = `, ${t}` + finalString
  }
  finalString = finalString.slice(2)
  isTypingIndicator.innerHTML = typing
})

form.addEventListener('submit', e => {
  e.preventDefault()
  
  socket.emit('isTyping', false)
  
  if(text.value == "") return false
  
  socket.emit('send', text.value)
  
  text.value=""
  
  return false
})

function toggleSnapping(){
  if(snapping){
    snapping = false;
    toggleSnap.innerHTML = "Turn on Snapping"
  } else {
    snapping = true;
    toggleSnap.innerHTML = "Turn off Snapping"
  }
}     

function urlify(text) {
  let urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function(url) {
    return '<a href="' + url + '" target="_blank">'  + url + '</a>';
  })
  // or alternatively
  // return text.replace(urlRegex, '<a href="$1">$1</a>')
}

socket.emit('fetchUsername')