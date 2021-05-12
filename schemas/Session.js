const mongoose = require('mongoose')
const generateRandomString = require('../utils/generateRandomString')

const SessionSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    unique: true
  },
  uid: {
    type: String,
    required: true,
  }
})

const SessionModel = mongoose.model('Sessions', SessionSchema)

async function get(_id){
  const schema = await SessionModel.findOne({
    _id
  })
  return schema ? schema.uid : null
}

async function create(uid){
  let _id;
  do {
    _id = generateRandomString(20);
  } while(!SessionModel.findOne({ _id }))
  
  await SessionModel.updateOne({
    _id,
  }, {
    _id,
    uid
  }, {
    upsert: true
  })
  return _id;
}

module.exports = {
  SessionModel,
  get,
  create,
}
