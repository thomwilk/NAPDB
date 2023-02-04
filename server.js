var express = require('express')
var app = express()
var port = 3000

var mongoose = require('mongoose')

require('./routes')(app)

app.set('view engine', 'pug')
app.set('views', './src/views')

mongoose.connect('mongodb://localhost:27017/NAPDB')

app.use(express.static(__dirname))
app.use(express.json())

app.listen(port, function() {
    console.log('Node.js listening on port ' + port)
})