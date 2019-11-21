/* Magic Mirror
 * Node Helper: MMM-MoonPhase
 *
 * By Nolan Kingdon
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

	// Override socketNotificationReceived method.

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
	socketNotificationReceived: function(notification, payload) {
		console.log("Moon received notification");
		console.log(notification);
		if (notification === "MMM-MoonPhase-GET-PHASE") {
			console.log("Calculating Moon Phase");
			let phase = this.calculatePhase();
			console.log("Phase is: " + phase);
		}
	},

	/*
	// Example function send notification test
	sendNotificationTest: function(payload) {
		this.sendSocketNotification("MMM-MoonPhase-NOTIFICATION_TEST", payload);
	},

	// this you can create extra routes for your module
	extraRoutes: function() {
		var self = this;
		this.expressApp.get("/MMM-MoonPhase/extra_route", function(req, res) {
			// call another function
			values = self.anotherFunction();
			res.send(values);
		});
	},

	// Test another function
	anotherFunction: function() {
		return {date: new Date()};
	}*/
});
