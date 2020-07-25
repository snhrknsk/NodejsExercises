/**
 * Refer to https://mebee.info/2020/02/10/post-4849/
 */
var express = require('express');
var ejs = require('ejs');
var mysql = require('mysql');
var app = express();

app.set('ejs', ejs.renderFile);

var con = mysql.createConnection({
    host: 'localhost',
    user:'user',
    password: '!1234Password',
    database:'testdb'
});

app.get('/', (req, res) => {
    con.query('select * from title', function(err, results, fields){
        if(err) throw err;
        res.render('temp.ejs', {
            content: results
        });
    });
});

app.listen(1234, ()=>{
    console.log('Start Server');
});
