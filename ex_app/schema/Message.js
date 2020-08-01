var mongoose = require('mongoose');

var Message = mongoose.Schema({
    username: String,
    message: String,
    date: String
});

module.exports = mongoose.model('Message', Message);