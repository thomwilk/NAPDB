const mongoose = require('mongoose')

const EpisodeSchema = new mongoose.Schema({
    producer: {
        type: String,
    },
})

module.exports = mongoose.model('episodes', EpisodeSchema)