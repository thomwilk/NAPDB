var mongoose = require('mongoose')
var cors = require('cors')
const { text } = require('express')

var Schema = mongoose.Schema

var CreditSchema = new Schema({
    producer: String,
    type: String,
    episode_number: Number,
}, {
    collection: 'credits'
})

CreditSchema.index({ producer: text })

var CreditModel = mongoose.model('Credit', CreditSchema)

module.exports = { CreditModel }