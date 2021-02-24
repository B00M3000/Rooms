const { Router } = require('express')
var router = Router()

router.get('/', (req, res) => {
  var { lastUsername, lastRoom } = req.cookies
  if(!lastUsername) lastUsername=""
  if(!lastRoom) lastRoom=""
  res.render('login', {
    lastUsername,
    lastRoom,
  })
})

router.post('/callback', (req, res) => {
  const { username, room } = req.body
  res.cookie('lastUsername', username)
  res.cookie('lastRoom', room)
  res.redirect(`/chat?username=${username}&room=${room}`)
})

module.exports = router