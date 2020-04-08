const catalyst = require('zcatalyst-sdk-node');
module.exports = (event, context) => {
	console.log(' in  event listener  ');
	var twilio = require('twilio');

	const catalystApp = catalyst.initialize(context);
	let zcql = catalystApp.zcql();
	var accSid = "";
	var AuthToken = "";
	var msgContent = "Kindly pickup an order";
	const client = new twilio(accSid, AuthToken);

	let zcqlPromise = zcql.executeZCQLQuery("SELECT * FROM Pickup where personWorkStatus='Free' ORDER BY createdtime DESC LIMIT 1");
	zcqlPromise.then(queryResult => {

		if (queryResult.length != 0) {
			//note that you can get the ROWID only when you get the select * as it shows all the columns.
			console.log('rowid is ----- ' + queryResult[0].Pickup.ROWID);
			let updatedRowData = {
				personWorkStatus: `Busy`,
				ROWID: queryResult[0].Pickup.ROWID
			};
			let datastore = catalystApp.datastore();
			let table = datastore.table('Pickup');
			let rowPromise = table.updateRow(updatedRowData);
			rowPromise.then((row) => {
				console.log('updated row - ' + row);

				try {
					client.messages
						.create({
							body: msgContent,
							from: 'twilionum',
							to: queryResult[0].Pickup.personMobileNumber + ''
						})
						.then(message => {
							console.log('The Twilio Response is ' + message.sid);
							context.closeWithSuccess();
						}).catch(err => {
							console.log('Error in twilio message' + err);
							context.closeWithFailure();
						});
				}
				catch (e) {
					console.log('Error   ' + e);
					context.closeWithFailure();
				}
			});

		}
		else {
			console.log('All are busy now!');
			try {
				client.messages
					.create({
						body: "All our pickup folks are busy now",
						from: 'twilionum',
						to: 'twilionum'
					})
					.then(message => {
						console.log('The Twilio Response now is ' + message.sid);
						context.closeWithSuccess();
					}).catch(err => {
						console.log('Error in twilio message' + err);
						context.closeWithFailure();
					});;
			}
			catch (e) {
				console.log('Error   ' + e);
				context.closeWithFailure();
			}
		}


	})

}
