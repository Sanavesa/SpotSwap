var port = 3000;
var express = require("express");
var app = express();
var server = app.listen(process.env.PORT || port);

app.use(express.static("public"));

console.log("Server running.");

var socket = require('socket.io');
var io = socket(server);

io.sockets.on('connect', newConnection);

var socketList = [];

function newConnection(newSock)
{
	console.log('New connection: ' + newSock.id);

	socketList.push(newSock);

	newSock.on('data', (data) =>
	{
		console.log('received data!');
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