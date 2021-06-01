require('dotenv').config()
require('pug')

const express = require('express');
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const cookieParser = require('cookie-parser')
const mongo = require('./mongo')

const PORT = process.env.PORT || 3000

const app = express();
const server = http.createServer(app)
const io = socketio(server)

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "/static")))
app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())

const SessionSchema = require('./schemas/Session.js')
const UserSchema  = require('./schemas/User.js')
const AvatarSchema = require('./schemas/Avatar')

app.use(async (req, res, next) => {
  const { SESSION_ID } = req.cookies
  const USER_ID =  await SessionSchema.get(SESSION_ID)
  if(SESSION_ID && USER_ID){
    const USER = await UserSchema.get({ _id: USER_ID })
    let avatar = await AvatarSchema.get(USER_ID)
    res.locals = {
      isAuthenticated: true,
      SESSION_ID,
      username: USER.username,
      uid: USER._id,
      avatarSrc: avatar ? `data:${avatar['Content-Type']};base64,${avatar.base64}` : undefined
    }
  } else {
    res.clearCookie('SESSION_ID')
    res.locals = {
      isAuthenticated: false,
    }
  }
  next()
})

io.on("connection", async (socket) => {
  const { SESSION_ID, ROOM } = socket.handshake.query
  
  const USER_ID =  await SessionSchema.get(SESSION_ID)
  const USER = await UserSchema.get({ _id: USER_ID })

  console.log(`A socket connected with the username ${USER.username} to the room ${ROOM}`)
  
  let channel_string = `room/${ROOM}`
  
  socket.join(channel_string)
  
  socket.on('fetchUsername', () => {
    socket.emit('username', USER.username)
  })
  
  io.to(channel_string).emit(`userJoin`, {
    user: USER.username
  })
  
  socket.on('send', content => {
    io.to(channel_string).emit(`message`, {
      type: 'user',
      author: USER.username,
      content
    })
  })
  
  socket.on('isTyping', isTyping => {
    io.to(channel_string).emit('userTyping', { isTyping, username: USER.username })
  })
  
  socket.on('getUsers', () => {
    var connections = []
    io.sockets.adapter.rooms.get(`room/${ROOM}`).forEach(async clientId => {
      s = io.sockets.sockets.get(clientId);
      const USER_ID =  await SessionSchema.get(s.handshake.query.SESSION_ID)
      const USER = await UserSchema.get({ _id: USER_ID })
      connections.push({
        username: USER.username,
        uid: USER_ID
      })
      io.to(channel_string).emit('users', connections)
    })
  })
  
  socket.on('disconnect', () => {
    console.log(`${USER.username} diconnected from ${ROOM}`)
    
    io.to(channel_string).emit(`userLeft`, {
      user: USER.username
    })
  })
});

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/rr', (req, res) => {
  res.render('rr')
})

app.use('/room', require('./routes/room'))
app.use('/user', require('./routes/user'))

// Handle 404
app.use((req, res) => {
  res.status(404).render('error', {
    error: {
      status: 404,
      message: "Page Not Found"
    }
  })
})

// // Handle 500
app.use((error, req, res, next) => {
  res.status(500).render('error', {
    error: {
      code: 500,
      message: "Internal Server Error"
    }
  }) 
  console.log(error)
});

server.listen(PORT, () => {
  console.log(`Server Started on Port ${PORT}`);
});

mongo().then(() => {
  console.log(`MongoDB Connection Established`)
})