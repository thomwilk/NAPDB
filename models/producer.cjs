const mongoose = require('mongoose')

const ProducerSchema = new mongoose.Schema({
    producer: {
        type: String,
    },
})

module.exports = mongoose.model('producer', ProducerSchema)