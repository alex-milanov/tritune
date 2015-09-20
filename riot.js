
require('events').EventEmitter.prototype._maxListeners = 100;

var PORT = 8888;
var HOST = '192.168.1.100';

var dgram = require('dgram');
var udp4server = dgram.createSocket('udp4');
var osc = require('osc-min')

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var path = require('path');


app.use(express.static(path.resolve('./dist')));

udp4server.on('listening', function () {
	var address = server.address();
	console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

var lastMessage = false;

udp4server.on('message', function (message, remote) {
	//onsole.log(remote.address + ':' + remote.port);
	//console.log(osc.fromBuffer(message));
	udp4server.on('message', function (msg, remote) {
		var message = osc.fromBuffer(msg);
		if(message.address == "/0/euler"){
			if(lastMessage === false 
				|| parseInt(message.args[0].value) !== parseInt(lastMessage.args[0].value)
				|| parseInt(message.args[1].value) !== parseInt(lastMessage.args[1].value)
				|| parseInt(message.args[2].value) !== parseInt(lastMessage.args[2].value)) {
				console.log(remote.address + ':' + remote.port);
				console.log(message);
				lastMessage = message;
				io.sockets.emit('riot:message', message);
			}
		}
	});

});

udp4server.bind(PORT, HOST);


server.listen(8080, function () {
	console.log('Listening on port: 8080');
});
io.sockets.on('connection', function (socket) {
	console.log('Websocket connection!');
	//console.log(socket.handshake);
	/*
	socket.on('send:msg', function (msg) {
		//console.log(msg);
	});
*/
});