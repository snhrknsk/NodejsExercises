/*
例Create HTML link page and read them to run
node sample.js
http://localhost:1234
*/
var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req, res){
    var target="";
    switch(req.url){
        case '/':
        case '/index':
            target='./index.html';
            break;
        case '/next':
            target='./next.html';
            break;
        default:
            res.writeHead(404, {'Context-Type': 'text/plain'});
            res.end("bad request");
            return;
    }
    fs.readFile(target, 'utf-8', function(err, data){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    })

});

server.listen(1234);
console.log('Start Server');