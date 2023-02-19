var mongoose = require('mongoose')
var cors = require('cors')
const { text } = require('express')

var Schema = mongoose.Schema

var EpisodeSchema = new Schema({
    number: Number,
    title: String,
    date: String,
    length: String,
    artist: String
}, {
    collection: 'episodes'
})

var EpisodeModel = mongoose.model('Episode', EpisodeSchema)

module.exports = { EpisodeModel }