var http = require('http');
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyparser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var session = require('express-session');

var ejs = require('ejs');
var Message = require('./schema/Message');
const User = require('./schema/User');
var app = express();

//app.use(bodyparser());//this is deprecated
app.use(bodyparser.urlencoded({extended: true}));
app.use(session( {secret: 'HogeFuga'}));//temporary session name
app.use(passport.initialize());
app.use(passport.session());

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

//
passport.serializeUser((user, done)=>{
  done(null, user._id);
});
passport.deserializeUser((id, done)=>{
  User.findOne({_id: id}, (err, user)=>{
    done(err, user);
  });
});

//Top page
app.get("/", (req, res, next) => {
  var username = req.query.name == undefined ? 'No Name' : req.query.name;
  if(Boolean(req.query.empty)) {
    Message.find({}, (err, msgs)=> {
      return res.render('index.ejs', 
      {
        user: req.session && req.session.user ? req.session.user : null,
        messages: msgs,
        emptyMessageError: 'Input message'
      });
    });
  } else {
    Message.find({}, (err, msgs)=> {
      return res.render('index.ejs', 
      {
        user: req.session && req.session.user ? req.session.user : null,
        messages: msgs,
        emptyMessageError: ''
      });
    });
  }
});

//signin page
app.get("/signin", (req, res, next)=>{
  return res.render('signin.ejs');
});

app.post("/signin", (req, res, next)=>{
  var time = new Date().toLocaleString({ timeZone: 'Asia/Tokyo' });
  console.log(time + ' : ' + req.body.username + ' ' + req.body.password);
  var newUser = new User({
    username: req.body.username,
    password: req.body.password,
    date: time
  });
  newUser.save((err)=>{
    if(err){
      throw err;
    }
    return res.redirect("/");
  })
})

app.get("/login", (req, res, next)=>{
  return res.render('login.ejs');
});

app.post('/login', passport.authenticate('local'), (req, res, next)=>{
  User.findOne({_id: req.session.passport.user}, (err, user)=>{
    if(err || !user || !req.session) {
      console.log('Disp login screen.')
      return res.redirect('/login.ejs');
    } else {
      req.session.user = {
        username: user.username,
      };
      return res.redirect("/");
    }
  })
});

//
passport.use(new LocalStrategy((username, password, done)=>{
  console.log(username + ' : ' + password);
  User.findOne({username: username}, (err, user)=>{
    if(err) {
      console.log('Error ' + err);
      return done(err);
    }
    if(!user) {
      console.log('Not found user.');
      return done(null, false, {message: 'Incorrect Username.'});
    }
    if(user.password !== password) {
      console.log('Incorrect password. saved = ' + user.password + ' input = ' + password);
      return done(null, false, {message: 'Incorrect Password.'})
    }
    console.log('Success to login');
    return done(null, user);
  });
}));

// app.post('/login', passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//   })
// );

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
    return res.redirect("/");
  });
});

var server = http.createServer(app);
server.listen(serverPort, ()=>{
  console.log('Start Server');
});
