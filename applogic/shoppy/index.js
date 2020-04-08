"use strict";

var express = require("express");
var app = express();
var twilio = require('twilio');

//If you do not use the following line, then you will never receive any post data
app.use(express.json());

//get the nodejs sdk
var catalyst = require("zcatalyst-sdk-node");

app.post("/addToDB", (req, res) => {

	var item_name = req.body.item_name;
	var quantity = req.body.qty;
	var phoneNumber = req.body.phoneNumber;

	console.log(" input data is  " + item_name + '         ' + quantity + '       phone ' + phoneNumber);


	var catalystApp = catalyst.initialize(req);
	insertToDB(catalystApp, item_name, quantity, phoneNumber);
	res.send("Order Placed Successfully !");
});

function insertToDB(catalystApp, itemName, qty, phoneNumber) {

	//Check if the Pickup boys are free or not. If not, respond saying so
	//	var pickupStatus = checkPickupFreeStatus();

	let rowData = {
		itemName: itemName,
		Quantity: qty,
		phoneNumber: phoneNumber

	};

	console.log('Orders are  -------------     ' + JSON.stringify(rowData));



	let datastore = catalystApp.datastore();
	let table = datastore.table("Orders");
	let insertPromise = table.insertRow(rowData);
	insertPromise.then(row => {
		//	console.log("database insertion done in table Orders");

		console.log(' in send SMS ');
		var accSid = "xx";
		var AuthToken = "bb";
		const client = new twilio(accSid, AuthToken);
		var whatsappString = 'whatsapp:' + phoneNumber;

		try {
			client.messages
				.create({
					body: "Dear Customer, we have received your order. Thx",
					from: 'twilio number',
					to: phoneNumber + ''
				})
				.then(message => {
					console.log('The Twilio Response here is ' + message.sid);
					client.calls
						.create({
							twiml: '<Response><Say>Received your order. Thanks.</Say></Response>',
							from: 'twilio number',
							to: phoneNumber + ''
						})
						.then(call => {

							console.log(call.sid);
							client.messages
								.create({
									from: 'whatsapp:twilionum',
									body: 'Order received. Thanks',
									to: whatsappString
								})
								.then(message => console.log('Whatsapp message ' + message.sid));
						});
				});
		}
		catch (e) {
			console.log('Error here   ' + e);

		}
	})


}




module.exports = app;
