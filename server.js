var port = 3000;
var express = require("express");
var app = express();
var server = app.listen(process.env.PORT || port);

app.use(express.static("public"));

console.log("Server starting to execute.");

var socket = require('socket.io');
var io = socket(server);

console.log("Server running on " + server.address().port);

io.sockets.on('connect', newConnection);

var socketList = [];

function newConnection(newSock)
{
	console.log('New connection: ' + newSock.id);
	console.log("Number of active connetcions: " + socketList.length);

	socketList.push(newSock);

	newSock.on('data', (data) =>
	{
		console.log('Received data from client!');
		console.log(data);
	});

	newSock.on('disconnect', (reason) =>
	{
		console.log('Connection ' + newSock.id + ' disconnected because ' + reason);
		let index = socketList.indexOf(newSock);
		if (index !== -1)
			socketList.splice(index, 1);
	});
}