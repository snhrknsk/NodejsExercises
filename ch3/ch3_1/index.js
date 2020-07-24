var http = require('http');
var fs = require('fs');
var ejs = require('ejs');
const { constants } = require('buffer');

var temp = fs.readFileSync('./temp.ejs', 'utf-8');

var server = http.createServer(function(req, res){
    var data = ejs.render(temp, {
        title:'EJS Test',
        contents1:'<p>Not Escape this section</p>',
        contents2:'<p>Escape this section</p>',
        arr:['Strawberry','Melon','Banana']
    });
    res.writeHead(200, {'Constant-Type':'text/html'});
    res.write(data);
    res.end();
});

server.listen(1234);
console.log('Start Server')