var mongoose = require('mongoose');

var User = mongoose.Schema({
  username: String,
  password: String,
  date: String,
});

module.exports = mongoose.model('User', User);