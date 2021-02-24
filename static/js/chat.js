var messages = document.getElementById('messages')
var form = document.getElementById('form')
var text = document.getElementById('text')


var params = new URLSearchParams(window.location.search)

var username = params.get('username')
var room = params.get('room')

var socket = io.connect('', {query: `username=${username}&room=${room}`})

socket.on(`${room}:message`, message => {
  var m = document.createElement('li')
  
  if(message.type == "user"){
    m.append(`${message.author}: ${message.content}`)
  }
  
  if(message.type == "join"){
    m.append(`System: ${message.user} joined!`)
  }
  
  if(message.type == "leave"){
    m.append(`System: ${message.user} left!`)
  }
  
  messages.append(m)
})

form.addEventListener('submit', e => {
  e.preventDefault()
  
  socket.emit('send', text.value)
  
  text.value=""
  
  return false
})