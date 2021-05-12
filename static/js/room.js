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
  
  if(message.type == "user"){
    m.append(`${message.author}: ${message.content}`)
  }
  
  messages.append(m)
  
  if(snapping){
    _messages.scrollTop = _messages.scrollHeight;
  }
})

socket.on('users', usersArray => {
  users.innerHTML = ""
  usersArray.forEach(c => {
    var li = document.createElement('li')
    users.append(c.username)
    users.append(li)
  })
})

socket.emit("")

form.addEventListener('submit', e => {
  e.preventDefault()
  
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