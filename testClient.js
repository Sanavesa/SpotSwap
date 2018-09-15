const address = "https://parkoo-erau-2018.herokuapp.com/";
const io = require("socket.io-client");
const fs = require("fs");

let name = null;
let studentID = null;
let longitude = null;
let latitude = null;
let client = null;

// Load name/sid from file
fs.readFile('testData.txt', 'utf8', function(err, contents)
{
	// Split file into name and and student ID
	var fileContents = contents.split("\n");
	name = fileContents[0];
	studentID = fileContents[1];
	longitude = fileContents[2];
	latitude = fileContents[3];

	console.log("Loaded:")
	console.log("\t Name = " + name);
	console.log("\t Student ID = " + studentID);
	console.log("\t  Longitude = " + longitude);
	console.log("\t Latitude = " + latitude);

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

	let data = {
		name: name,
		sid: studentID,
		long: longitude,
		lat: latitude
	};
	client.emit("data", data);

	client.on("error", function(err) {
		console.log("Error occured: " + err);
	});

	client.on("connect", function() {
		console.log("Connection status: " + client.connected);
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