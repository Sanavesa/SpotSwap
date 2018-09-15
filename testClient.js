const address = "https://parkoo-erau-2018.herokuapp.com/";
// const address = "127.0.0.1:3000";
const io = require("socket.io-client");
const fs = require("fs");

let client = null;

let name = null;
let studentID = null;
let longitude = null;
let latitude = null;
let isDriver = null;
let parkingLot = null;

// Load name/sid from file
fs.readFile('testData.txt', 'utf8', function(err, contents)
{
	// Split file into name and and student ID
	var fileContents = contents.split("\n");
	name = fileContents[0];
	studentID = parseInt(fileContents[1]);
	longitude = Number(fileContents[2]);
	latitude = Number(fileContents[3]);
	isDriver = (parseInt(fileContents[4]) === 1);
	parkingLot = fileContents[5];

	console.log("Loaded:")
	console.log("\t Name = " + name);
	console.log("\t Student ID = " + studentID);
	console.log("\t Longitude = " + longitude);
	console.log("\t Latitude = " + latitude);
	console.log("\t Is Driver = " + isDriver);
	console.log("\t Parking Lot = " + parkingLot);

	main();
});


function main()
{
	console.log("Trying to connect to " + address + "...");
	client = io.connect(address);

	/*
	client.on("welcome", onWelcome);

	function onWelcome(data)
	{
		console.log("WELCOME");
		console.log(data);
	}
	*/

	/*
	let data = {
		name: name,
		sid: studentID,
		long: longitude,
		lat: latitude
	};
	client.emit("data", data);
	*/

	client.on("echo", function(data) {
		console.log("ECHO!");
		console.log(data);
	});

	client.on("matched", function(data) {
		console.log("I HAVE BEEN MATCHED!");
		console.log(data);

		var interval = setInterval(function() {
			longitude++;
			latitude--;
			sendLocation(client, longitude, latitude);

			if(longitude >= 50)
			{
				clearInterval(interval);
				sendCompleteTransit(client);
			}
		}, 5000);
	});

	client.on("completeTransit", function() {
		console.log("Completed transit!");
	});

	client.on("location", function(data) {
		console.log("Matched user is at " + data.longitude + " , " + data.latitude);
	});

	client.on("error", function(err) {
		console.log("Error occured: " + err);
	});

	client.on("connect", function() {
		console.log("Connection status: " + client.connected);

		if(client.connected)
		{
			setTimeout(function() {
				sendRequest(client, name, studentID, longitude, latitude, isDriver, parkingLot);
			}, 2000);
		}
	});

	client.on("disconnect", function(reason) {
		console.log("Disconnection status: " + client.disconnected);
		if(reason === "io server disconnect") {
			console.log("Disconnected by server");
		} else {
			console.log("Disconnected by client");
		}
	});

	client.on("connect_error", function(err) {
		console.log("Connection error: " + err);
	});

	client.on("connect_timeout", function() {
		console.log("Connection timeout");
	});

	client.on("reconnect", function(attempt) {
		console.log("Successful reconnection at attempt " + attempt);
	});

	client.on("reconnect_attempt", function() {
		console.log("Attempting to reconnect");
	});

	client.on("reconnecting", function(attempt) {
		console.log("Reconnecting at attempt " + attempt);
	});

	client.on("reconnect_error", function(err) {
		console.log("Failed to reconnect: " + err);
	});

	client.on("reconnect_failed", function() {
		console.log("Failed to reconnect even with attempts");
	});

	client.on("ping", function() {
		console.log("Ping packet written to server");
	});

	client.on("pong", function(latency) {
		console.log("Pong packet received from server: latency is " + latency + "ms");
	});
}

// Sends a request to the server for a parking spot
function sendRequest(socket, name, studentID, longitude, lattitude, isDriver, parkingLot)
{
	// Abort early if socket is not connected
	if(socket == null || socket.connected == false)
	{
		console.log("Failed to send request as socket is not connected");
		return;
	}

	// Construct a packet from the given parameters
	let data = {
		name: name,
		studentID: studentID,
		longitude: longitude,
		latitude: latitude,
		isDriver: isDriver,
		parkingLot: parkingLot
	};

	socket.emit("request", data);
}

// Tells server to cancel the request of finding a match
function cancelRequest(socket)
{
	// Abort early if socket is not connected
	if(socket == null || socket.connected == false)
	{
		console.log("Failed to send cancel request as socket is not connected");
		return;
	}

	socket.emit("cancelRequest", null);
}

// Tells the server to complete the transit 
function sendCompleteTransit(socket)
{
	// Abort early if socket is not connected
	if(socket == null || socket.connected == false)
	{
		console.log("Failed to send complete transit as socket is not connected");
		return;
	}

	socket.emit("completeTransit", null);
}

// Sends the client's location to the server
function sendLocation(socket, longitude, latitude)
{
	// Abort early if socket is not connected
	if(socket == null || socket.connected == false)
	{
		console.log("Failed to send location as socket is not connected");
		return;
	}

	// Construct a packet from the given parameters
	let data = {
		longitude: longitude,
		latitude: latitude
	};

	socket.emit("location", data);
}