/*
例Create HTML link page and read them to run
Cache the static page files
node sample.js
http://localhost:1234
*/
var http = require('http');
var fs = require('fs');

var indexPage = fs.readFileSync("./index.html", 'utf-8');
var nextPage = fs.readFileSync("./next.html", 'utf-8');

var server = http.createServer(function(req, res){
    var target="";
    switch(req.url){
        case '/':
        case '/index':
            target=indexPage;
            break;
        case '/next':
            target=nextPage;
            break;
        default:
            res.writeHead(404, {'Context-Type': 'text/plain'});
            res.end("bad request");
            return;
    }
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(target);
    res.end();

});

server.listen(1234);
console.log('Start Server');