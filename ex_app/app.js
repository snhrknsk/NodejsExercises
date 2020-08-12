var http = require('http');
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyparser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var TwitterStrategy = require('passport-twitter').Strategy;
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var logger = require('./lib/logger');

var ejs = require('ejs');
var Message = require('./schema/Message');
const User = require('./schema/User');
var app = express();

//app.use(bodyparser());//this is deprecated
app.use(bodyparser.urlencoded({extended: true}));
app.use(session( {
  secret: 'HogeFuga',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    db: 'session',
    ttl: 14*24*60*60
  }),
  // cookie: {
  //   secure: true
  // },
}));//temporary session name
app.use(passport.initialize());
app.use(passport.session());

const dbURL = 'mongodb://localhost:27017/testdb';
const serverPort = 3000;

//set twitter api key to your environment variable
const twitterConfig = {
  consumerKey: process.env.TWITTER_COMSUMER_KEY, 
  consumerSecret: process.env.TWITTER_COMSUMER_SECRET,
  callbackURL: process.env.TWITTER_CALLBACK_URL,
};

//DB Connection
mongoose.connect(dbURL, {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
  if(err) {
    logger.error(err);
  } else {
    logger.info('Successfully connected to MongoDB');
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
  logger.info(time + ' : ' + req.body.username + ' ' + req.body.password);
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
      logger.info('Disp login screen.')
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
  logger.info(username + ' : ' + password);
  User.findOne({username: username}, (err, user)=>{
    if(err) {
      logger.error('Error ' + err);
      return done(err);
    }
    if(!user) {
      logger.error('Not found user.');
      return done(null, false, {message: 'Incorrect Username.'});
    }
    if(user.password !== password) {
      logger.error('Incorrect password. saved = ' + user.password + ' input = ' + password);
      return done(null, false, {message: 'Incorrect Password.'})
    }
    logger.info('Success to login');
    return done(null, user);
  });
}));

passport.use(new TwitterStrategy(twitterConfig, (token, tokenSecret, profile, done)=>{
  User.findOne({twitter_profile_id: profile.id}, (err, user)=>{
    if(err) {
      logger.error('Not found user. Err= ' + err);
      return done(err);
    } else if(!user) {
      logger.error('Found user');
      var time = new Date().toLocaleString({ timeZone: 'Asia/Tokyo' });
      var _user = {
        username: profile.displayName,
        twitter_profile_id: profile.id,
        date: time
      };
      var newUser = new User(_user);
      newUser.save((err)=>{
        if(err) {
          throw err;
        }
        return done(null, newUser);
      });
    } else {
      return done(null, user);
    }
  })
}));

app.get('/oauth/twitter', passport.authenticate('twitter'));
app.get('/oauth/twitter/callback', passport.authenticate('twitter'), (req, res, next)=>{
  logger.info('Callback twitter oauth. ' + req.session.passport);
  User.findOne({_id: req.session.passport.user}, (err, user)=>{
    if(err || !req.session) {
      return res.redirect('oauth/twitter');
    }
    req.session.user = {
      username: user.username,
    }
    return res.redirect("/");
  })
});

//Save userinfo and redirect
app.post("/update", (req, res, next) => {
  if(req.body.message == '') {
    return res.redirect("/?empty=true");
  }
  var time = new Date().toLocaleString({ timeZone: 'Asia/Tokyo' });
  // var username = req.body.username == '' ? 'No Name' : req.body.username ;
  var username = req.session.user.username;
  var newMessage = new Message({
    username: username,
    message: req.body.message,
    date : time
  });
  newMessage.save((err)=>{
    if(err) throw err;
    logger.info('Success to save user message : ' + newMessage.username + ' time : ' + time);
    return res.redirect("/");
  });
});

//500 Test
app.get("/testpage", (req, res, next)=>{
  throw new Error("Test Error");
});

app.use((req, res, next)=>{
  var err = new Error('Not Found');
  err.status = 404;
  return res.render('error.ejs', {
    message: err.message,
    status: err.status,
  });
});

app.use((err, req, res, next)=>{
  res.status(err.status || 500);
  return res.render('error.ejs', {
    message: err.message,
    status: err.status || 500,
  });
});

var server = http.createServer(app);
server.listen(serverPort, ()=>{
  logger.info('Start Server');
});
