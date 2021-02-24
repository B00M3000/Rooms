require('dotenv').config()
require('pug')

const express = require('express');
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')

const PORT = process.env.PORT || 3000

const app = express();
const server = http.createServer(app)
const io = socketio(server, {
  
})

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "/static")))
app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())

const pages = path.join(__dirname, 'pages')

io.on('connection', socket => {
  const { username, room } = socket.handshake.query
  
  console.log(`A socket connected with the username ${username} to the room ${room}`)
  
  io.emit(`${room}:message`, {
    type: "join",
    user: username
  })
  
  socket.on('send', content => {
    io.emit(`${room}:message`, {
      type: 'user',
      author: username,
      content
    })
  })
  
  socket.on('disconnect', () => {
    console.log(`${username} diconnected from ${room}`)
    
    io.emit(`${room}:message`, {
      type: "leave",
      user: username
    })
  })
})

app.get('/', (req, res) => {
  res.render('index')
})

app.use('/login', require('./routes/login'))

app.get('/chat', (req, res) => {
  const { username, room } = req.query
  if(!username || !room) return res.redirect('/login')
  
  res.render('chat', {
    username,
    room,
    messages: []
  })
});

server.listen(PORT, () => {
  console.log(`Server Started on Port ${PORT}`);
});