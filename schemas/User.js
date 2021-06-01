const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const generateRandomString = require('../utils/generateRandomString')

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    'Content-Type': String,
    Data: String
  }
})

const UserModel = mongoose.model('Users', UserSchema)

async function get(search){
  const schema = await UserModel.findOne(search)
  return schema || null
}

async function authenticate(search, password){
  const schema = await UserModel.findOne(search);
  if(!schema) return null;
  const validPassword = await bcrypt.compare(password, schema.password);
  return validPassword;
}

async function create(username, password){
  let _id;
  do {
    _id = generateRandomString(20);
  } while(await UserModel.findOne({ _id }))
  
  if(await get({username})) {
    return null;
  }
  
  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
  
  await UserModel.updateOne({
    _id,
  }, {
    _id,
    username,
    password
  }, {
    upsert: true
  })
  
  return _id;
}

module.exports = {
  UserModel,
  authenticate,
  get,
  create,
}
