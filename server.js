var port = 3000;
var express = require("express");
var app = express();
var server = app.listen(process.env.PORT || port);

const UserStatus =
{
	IDLE: "idle",
	REQUESTED: "requested",
	MATCHED: "matched"
}

app.use(express.static("public"));

console.log("Server starting to execute.");

var socket = require('socket.io');
var io = socket(server);

console.log("Server running on " + server.address().port);

io.sockets.on('connect', newConnection);

var clients = [];

function newConnection(newSock)
{
	addClient(newSock);

	console.log('New connection: ' + newSock.id);
	console.log("Number of active connetcions: " + Object.keys(clients).length);

	/*
	newSock.on("data", (data) => {
		console.log("rcvd data");
		console.log(data);
	});
	*/

	newSock.on("credentials", (data) => onCredentials(newSock, data));
	newSock.on("request", (data) => onRequest(newSock, data));
	newSock.on("location", (data) => onLocation(newSock, data));
	newSock.on('disconnect', (reason) => onDisconnect(newSock, reason));
}

function addClient(socket)
{
	clients[socket.id] = 
	{
			socket: socket,
			name: null,
			studentID: null,
			longitude: null,
			latitude: null,
			isDriver: null,
			parkingLot: null,
			status: UserStatus.IDLE
	};

	console.log("Added client " + socket.id);
	//console.log(clients[socket.id]);
}

function findClient(socket)
{
	return clients[socket.id];
}

function removeClient(socket)
{
	delete clients[socket.id];
}

function onCredentials(sender, data)
{
	console.log("Received credentials packet from client " + sender.id);
	console.log(data);

	let client = findClient(sender);
	client.name = data.name;
	client.studentID = data.studentID;

	echo(sender, data);
}

function onRequest(sender, data)
{
	console.log("Received request packet from client " + sender.id);
	console.log(data);

	let client = findClient(sender);
	client.longitude = data.longitude;
	client.latitude = data.latitude;
	client.isDriver = data.isDriver;
	client.parkingLot = data.parkingLot;

	echo(sender, data);
}

function onLocation(sender, data)
{
	console.log("Received location packet from client " + sender.id);
	console.log(data);

	let client = findClient(sender);
	client.longitude = data.longitude;
	client.latitude = data.latitude;

	echo(sender, data);
}

function onDisconnect(socket, reason)
{
	console.log('Connection ' + socket.id + ' disconnected because ' + reason);
	removeClient(socket);
}

function findMatches()
{

}

function echo(socket, data)
{
	socket.emit("echo", data);
}