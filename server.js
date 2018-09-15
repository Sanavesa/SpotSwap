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

setInterval(function()
{
	// Find matches regularly while server has clients
	if(Object.keys(clients).length >= 2)
	{
		findMatches();
	}
}, 1000);

function newConnection(newSock)
{
	addClient(newSock);

	console.log('New connection: ' + newSock.id);
	console.log("Number of active connetcions: " + Object.keys(clients).length);

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
			state: UserState.IDLE,
			matchedSocketID: null
	};

	console.log("Added client " + socket.id);
}

function findClientBySocket(socket)
{
	return clients[socket.id];
}

function findClientByID(socketID)
{
	return clients[socketID];
}

function removeClient(socketID)
{
	delete clients[socketID];
}

function onRequest(sender, data)
{
	console.log("Received request packet from client " + sender.id);
	console.log(data);

	let client = findClientBySocket(sender);
	client.name = data.name;
	client.studentID = data.studentID;
	client.longitude = data.longitude;
	client.latitude = data.latitude;
	client.isDriver = data.isDriver;
	client.parkingLot = data.parkingLot;
	client.state = UserState.REQUESTED;
	client.matchedSocketID = null;

	// echo(sender, data);
}

function onCancelRequest(sender)
{
	console.log("Received cancel request packet from client " + sender.id);

	let client = findClientBySocket(sender);
	client.state = UserState.IDLE;
	client.matchedSocketID = null;
}

function onCompleteTransit(sender)
{
	console.log("Received complete transit packet from client " + sender.id);

	let client = findClientBySocket(sender);
	let client2 = findClientByID(client.matchedSocketID);

	// Tell both that the transit is over
	client.socket.emit("completeTransit", null);
	client2.socket.emit("completeTransit", null);

	client.state = UserState.IDLE;
	client.matchedSocketID = null;

	client2.state = UserState.IDLE;
	client2.matchedSocketID = null;
}

function onLocation(sender, data)
{
	console.log("Received location packet from client " + sender.id);
	console.log(data);

	let client = findClientBySocket(sender);
	client.longitude = data.longitude;
	client.latitude = data.latitude;

	// Broadcast the location to the matched user
	if(client.matchedSocketID != null)
	{
		let client2 = findClientByID(client.matchedSocketID);
		let data = {
			longitude: client.longitude,
			latitude: client.latitude
		};
		client2.socket.emit("location", data);
		console.log("sent location to matched bruh");
	}
	else
	{
		console.log("cant send to matched cuz bruh");
	}
	// echo(sender, data);
}

function onDisconnect(socket, reason)
{
	console.log('Connection ' + socket.id + ' disconnected because ' + reason);
	removeClient(socket);
}

function findMatches()
{
	// console.log("Finding matches...");
	let lookingForSpot = [];
	let lookingForRide = [];
	// Match users that are not in REQUESTED state
	Object.keys(clients).forEach(function(key)
	{
		if(clients[key].state === UserState.REQUESTED)
			if(clients[key].isDriver)
				lookingForSpot.push(key);
			else
				lookingForRide.push(key);

			// console.log(key +  " =>  " + clients[key].name);
	});

	// Match a person that is looking for a ride with a person looking for a spot, until no more
	while(lookingForSpot.length > 0 && lookingForRide.length > 0)
	{
		let spotKey = lookingForSpot.pop();
		let rideKey = lookingForRide.pop();

		let spotClient = clients[spotKey];
		let rideClient = clients[rideKey];

		// Tell each they have been matched
		let data =
		{
			name: rideClient.name,
			studentID: rideClient.studentID,
			longitude: rideClient.longitude,
			latitude: rideClient.latitude,
			isDriver: rideClient.isDriver,
			parkingLot: rideClient.parkingLot,
		};

		spotClient.socket.emit("matched", data);
		spotClient.state = UserState.MATCHED;

		data =
		{
			name: spotClient.name,
			studentID: spotClient.studentID,
			longitude: spotClient.longitude,
			latitude: spotClient.latitude,
			isDriver: spotClient.isDriver,
			parkingLot: spotClient.parkingLot,
		};

		rideClient.socket.emit("matched", data);
		rideClient.state = UserState.MATCHED;

		console.log("\tMatched " + spotClient.name + " with " + rideClient.name);
	}
}

function echo(socket, data)
{
	socket.emit("echo", data);
}