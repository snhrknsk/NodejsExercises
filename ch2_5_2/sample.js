/*
例Create HTML provide static data
node sample.js
http://localhost:1234
*/
var http = require('http');
var fs = require('fs');
var url = require('url');

var server = http.createServer(function(req, res){
    
    var urlParts = url.parse(req.url);
    var path = __dirname + '/' + urlParts.pathname;

    if (req.url === '/favicon.ico') {
        console.log('favicon requested but ignore');
        res.writeHead(200, {'Content-Type': 'image/x-icon'} );
        res.end();
    }else{
        console.log('File path is ' + path);
        var stream = fs .createReadStream(path);
        stream.pipe(res);
    }
});

server.listen(1234);
console.log('Start Server');