const { Router } = require('express')
const UserSchema = require('../schemas/User')
const SessionSchema = require('../schemas/Session')
var router = Router()

router.get('/', (req, res) => {
  if(res.locals.isAuthenticated){
    res.render('user')
  } else {
    res.redirect('/user/login')
  }
})

router.get('/logout', (req, res) => {
  res.clearCookie('SESSION_ID')
  res.redirect('/user')
})

router.get('/login', (req, res) => {
  if(res.locals.isAuthenticated){
    res.redirect('/user')
  } else {
    res.render('user/login')
  }
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if(!username || !password) res.status(400).json({ error: "Invalid Request" })
  const user = await UserSchema.get({ username })
  if(!user) return res.status(404).json({ error: "User Not Found" })
  const authenticated = await UserSchema.authenticate({ _id: user._id }, password)
  if(authenticated){
    const SESSION_ID = await SessionSchema.create(user._id)
    res.cookie('SESSION_ID', SESSION_ID)
    res.status(200).json({ message: "Authentication Successful", redirect: "/user"})
  } else res.status(401).json({ error: "Authentication Failed" })
})

router.get('/signup', (req, res) => {
  if(res.locals.isAuthenticated){
    res.redirect('/user')
  } else {
    res.render('user/signup')
  }
})

router.post('/signup', async (req, res) => {
  const { username, password } = req.body
  if(!username || !password) res.status(400).json({ error: "Invalid Request" })
  const _id = await UserSchema.create(username , password)
  const SESSION_ID = await SessionSchema.create(_id)
  res.cookie('SESSION_ID', SESSION_ID)
  res.status(200).json({ message: "Account Creation Successful", redirect: "/user"})
})

module.exports = router