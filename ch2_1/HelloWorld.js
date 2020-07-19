/*
例Hello world
node Hello World.js
http://localhost:1234
*/
var http = require('http');

var server = http.createServer(function(req, res){
    res.writeHead(200, {'Context-Type':'text/plain'});
    res.write('Hello World');
    res.end();
});

server.listen(1234);
console.log('Start Server');