const { Router } = require('express')
var router = Router()

router.use((req, res, next) => {
  if(res.locals.isAuthenticated) next()
  else res.redirect('/user')
})

router.get('/', (req, res) => res.redirect('/user'))

router.get('/:room', (req, res) => {
  const { username } = res.locals
  const { room } = req.params
  if(!username || !room) return res.redirect('/user')
  
  res.render('room', {
    username,
    room,
    messages: [],
    users: []
  })
})

module.exports = router