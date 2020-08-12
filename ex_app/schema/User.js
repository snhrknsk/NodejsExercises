var mongoose = require('mongoose');

var User = mongoose.Schema({
  username: String,
  password: String,
  twitter_profile_id: String,
  date: String,
});

module.exports = mongoose.model('User', User);