/*
例Create HTML template read them to run
node sample.js
http://localhost:1234
*/
var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req, res){
    fs.readFile('./temp.html', 'utf-8', function(err, data){
        res.writeHead(200, {'Context-Type': 'text/html'});
        res.write(data);
        res.end();
    });
});

server.listen(1234);
console.log('Start Server');