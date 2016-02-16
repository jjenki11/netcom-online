/*
Christopher Frenchi
2/7/16
source:https://nodejs.org/dist/latest-v4.x/docs/api/synopsis.html

simple nodejs server
*/

const http = require('http');

http.createServer( (request, response) => {
	response.writeHead(200, {'Content-Type': 'text/plain'});
	response.end('Hello World\n');
}).listen(8124);

console.log('Server running at http:127.0.0.1:8124/');

