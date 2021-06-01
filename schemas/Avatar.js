const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const generateRandomString = require('../utils/generateRandomString')

const AvatarSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  'Content-Type': String,
  base64: String
})

const AvatarModel = mongoose.model('Avatars', AvatarSchema)

async function get(uid){
  const schema = await AvatarModel.findOne({uid})
  return schema || null
}

async function set(uid, type, base64){
  await AvatarModel.updateOne({ uid }, { uid, 'Content-Type': type, base64 }, { upsert: true })
  return true
}

module.exports = {
  AvatarModel,
  set,
  get
}
