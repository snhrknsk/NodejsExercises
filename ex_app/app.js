var http = require('http');
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyparser = require('body-parser');

var Message = require('./schema/Message');
var ejs = require('ejs');
var app = express();

//app.use(bodyparser());
app.use(bodyparser.urlencoded({extended: true}));

const dbURL = 'mongodb://localhost:27017/testdb';
const serverPort = 3000;

//DB Connection
mongoose.connect(dbURL, {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
  if(err) {
    console.log(err);
  } else {
    console.log('Successfully connected to MongoDB');
  }
});

//Top page
app.get("/", (req, res, next) => {
  var username = req.query.name;
  if(Boolean(req.query.empty)) {
    Message.find({}, (err, msgs)=> {
      return res.render('index.ejs', 
      {
        title: 'Hello World',
        title2: 'Free chat',
        name: username,
        messages: msgs,
        emptyMessageError: 'Input message'
      });
    });
  } else {
    Message.find({}, (err, msgs)=> {
      return res.render('index.ejs', 
      {
        title: 'Hello World',
        title2: 'Free chat',
        name: username,
        messages: msgs,
        emptyMessageError: ''
      });
    });
  }
});

//Save userinfo and redirect
app.post("/update", (req, res, next) => {
  if(req.body.message == '') {
    return res.redirect("/?empty=true");
  }
  var time = new Date().toLocaleString({ timeZone: 'Asia/Tokyo' });
  var username = req.body.username == '' ? 'No Name' : req.body.username ;
  var newMessage = new Message({
    username: username,
    message: req.body.message,
    date : time
  });
  newMessage.save((err)=>{
    if(err) throw err;
    console.log('Success to save user : ' + newMessage.username + ' time : ' + time);
    return res.redirect("/?name=" + req.body.username);
  });
});

app.use(function(req, res, next) {
  next(createError(404));
});

var server = http.createServer(app);
server.listen(serverPort);



