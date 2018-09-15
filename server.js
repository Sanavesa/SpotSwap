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
	socketList.push(newSock);

	console.log('New connection: ' + newSock.id);
	console.log("Number of active connetcions: " + socketList.length);

	newSock.on("request", (data) =>
	{	
		onRequest(newSock, data);
	});

	newSock.on("location", (data) =>
	{
		onLocation(newSock, data);
	});

	newSock.on('disconnect', (reason) =>
	{
		console.log('Connection ' + newSock.id + ' disconnected because ' + reason);
		let index = socketList.indexOf(newSock);
		if (index !== -1)
			socketList.splice(index, 1);
	});
}

function onRequest(sender, data)
{
	console.log("Received request packet from client " + newSock.id);
	console.log(data);
}

function onLocation(sender, data)
{
	console.log("Received location packet from client " + newSock.id);
	console.log(data);
}

var requests = [];

function addToRequest(sock)
{

}

function findMatches()
{

}