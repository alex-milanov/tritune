'use strict';

// express & socket output
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var path = require('path');

app.use(express.static(path.resolve('./dist')));

// input serial port
var SerialPort = require('serialport');
var port = new SerialPort('/dev/ttyACM0',{
  parser: SerialPort.parsers.readline('\n')
});

port.on('open', function() {
	port.on('data', function(data){
		try {
			const message = JSON.parse(data.toString());
			console.log(message);

			io.sockets.emit('accpot:message', message);
		} catch (e) {

		}
	});
	port.on('error', function(err) {
	  console.log('Error: ', err.message);
	})
});


server.listen(3000, function () {
	console.log('Listening on port: 3000');
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
