const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userShema = new Schema({
    nickname: String,
    email: String,
    password: String,
    active: {
        type: Boolean,
        default: false
    },
    a_code: String
})

module.exports = mongoose.model('User', userShema)