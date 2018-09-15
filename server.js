var port = 3000;
var express = require("express");
var app = express();
var server = app.listen(process.env.PORT || port);

const UserState =
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
	newSock.on("cancelRequest", () => onCancelRequest(newSock));
	newSock.on("completeTransit", () => onCompleteTransit(newSock));
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
			state: UserState.IDLE
	};

	console.log("Added client " + socket.id);
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
	client.name = data.name;
	client.studentID = data.studentID;
	client.longitude = data.longitude;
	client.latitude = data.latitude;
	client.isDriver = data.isDriver;
	client.parkingLot = data.parkingLot;
	client.state = UserState.REQUESTED;

	echo(sender, data);

	findMatches();
}

function onCancelRequest(sender)
{
	console.log("Received cancel request packet from client " + sender.id);

	let client = findClient(sender);
	client.state = UserState.IDLE;
}

function onCompleteTransit(sender)
{
	console.log("Received complete transit packet from client " + sender.id);

	let client = findClient(sender);
	client.state = UserState.IDLE;
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
	// Match users that are not in REQUESTED state
	Object.keys(clients).forEach(function(key)
	{
		if(clients[key].state === UserState.REQUESTED)
			console.log(key, clients[key]);
	});
}

function echo(socket, data)
{
	socket.emit("echo", data);
}