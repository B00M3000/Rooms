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

io.on('connection', socket => {
  const { username, room } = socket.handshake.query
  
  console.log(`A socket connected with the username ${username} to the room ${room}`)
  
  const channelID = `Room ${room}`
  
  socket.join(channelID)
  
  const channel = io.sockets.in(channelID)
  
  channel.emit(`userJoin`, {
    user: username
  })
  
  socket.on('send', content => {
    channel.emit(`message`, {
      type: 'user',
      author: username,
      content
    })
  })
  
  socket.on('getUsers', () => {
    var connections = []
    channel.sockets.forEach(s => {
      const query = s.handshake.query
      const username = query.username
      connections.push({
        username
      })
    })
    socket.emit('users', connections)
  })
  
  socket.on('disconnect', () => {
    console.log(`${username} diconnected from ${room}`)
    
    channel.emit(`userLeft`, {
      user: username
    })
  })
})

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/rr', (req, res) => {
  res.render('rr')
})

app.use('/login', require('./routes/login'))

app.get('/chat', (req, res) => {
  const { username, room } = req.query
  if(!username || !room) return res.redirect('/login')
  
  res.render('chat', {
    username,
    room,
    messages: [],
    users: []
  })
});

// Handle 404
app.use((req, res) => {
  res.status(404)
  res.render('errors/404')
})

// // Handle 500
app.use((error, req, res, next) => {
  res.status(505)
  res.render('errors/500')
  console.log(error)
});

server.listen(PORT, () => {
  console.log(`Server Started on Port ${PORT}`);
});