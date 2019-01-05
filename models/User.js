const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userShema = new Schema({
    nickname: {
        type: String,
        required: true
      },
    email: {
        type: String,
        required: true
      },
    password: {
        type: String,
        required: true
      },
    active: {
        type: Boolean,
        default: false
    },
    a_code: String
})

module.exports = mongoose.model('User', userShema)