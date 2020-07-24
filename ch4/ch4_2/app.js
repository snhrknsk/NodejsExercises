/**
 * create views folder for express ejs file loading
 */
var express = require('express');
var ejs = require('ejs');
var app = express();

app.engine('ejs', ejs.renderFile);

app.get('/', function(req, res){
    //load this file from views folder automatically
    res.render('temp.ejs', {
        contents:'<p>hoge</p>'
    });
});

var server = app.listen(1234, function(){
    console.log('Start Server');
});