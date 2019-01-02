const mongoose = require('mongoose')
const Schema = mongoose.Schema

const noteShema = new Schema({
    title: {
        type: String,
        maxlength: 200
    },
    content: String,
    user:{
        ref: 'users',
        type: Schema.Types.ObjectId
    },
    date:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Note', noteShema)