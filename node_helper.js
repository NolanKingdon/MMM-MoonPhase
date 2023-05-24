/* Magic Mirror
 * Node Helper: MMM-MoonPhase
 *
 * By Nolan Kingdon
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
	socketNotificationReceived: function(notification, payload) {
		switch(notification) {
			case 'CALCULATE_MOONDATA':
				const data = this.getMoonPhase(payload.x/2);
				this.sendSocketNotification('CURRENT_MOONDATA', data);
				break;
			default:
				console.error('Unexpected notification', notification, payload);
				break;
		}
	},
	getMoonPhase: function(radius){ // Gets the current Julian date
		/* NOTE - Math was heavily referenced from here:
		 *
		 * https://medium.com/@refik/a-journey-and-a-method-for-drawing-spheres-5b24246ca479
		 * https://github.com/refik/rotate-sphere
		 *
		 * A great writeup + the code tool he mentions in the article. These have been a great help
		 * to me.
		 */
		const currDate = new Date();
		let d = currDate.getDate();
		let m = currDate.getMonth()+1;
		let y = currDate.getFullYear();

		// Adjusting as per our formula found above
		if (m === 1 || m === 2){
		  y = y-1;
		  m = m + 12;
		}

		// Formula to determine number of new moons Julian dates
		const a   = y/100;
		const b   = a/4;
		const c   = 2-a+b;
		const e   = 365.25 * (y+4716);
		const f   = 30.6001 * (m+1);
		const jd  = c + d + e + f - 1524.5;
		const daysSinceNew  = jd - 2451549.5;
		const newMoons      = daysSinceNew / 29.53;
		const moonFraction  = "0." + newMoons.toString().split(".")[1];
		// Our final Digit - 29.53 days a moon cycle. 15 is full moon. 0/29.5 is new
		const dayOfCycle    = parseFloat(moonFraction * 29.53);
		const dayOfCycleMod = dayOfCycle%15; // Allows us to utilize the 180deg math below --> Use the same curve twice = less calc

		const points = [];
	  const rotateA = [0, 360*(dayOfCycleMod/29.5), 0]; // rotation angles
		const increaseBy = 2;
		
		for (i = 0; i < 180; i += increaseBy) {
			points.push(
				this.rotate(
					this.sphericalToPoint(90, i, radius),
					rotateA
				)
			);
		}

		// Returning our modded day AND our actual day
		return {
			points,
			jDate: [dayOfCycleMod, dayOfCycle]
		};
	}, 
	rotate: function(coor, rotateA) {
		return this.rotateForAxis(
			2, 
			this.rotateForAxis(
				1, 
				this.rotateForAxis(
					0, 
					coor,
					rotateA[0]
				),
				rotateA[1]
			), 
			rotateA[2]
		);
	},
	degreesToRadians: function(angle) {
		return angle * (Math.PI / 180);
	},
	// Convert spherical coordinate to x y z coordinate
	sphericalToPoint: function(ascension, declination, r) {
		ascension = this.degreesToRadians(ascension);
		declination = this.degreesToRadians(declination);
		return [
			Math.sin(ascension) * Math.sin(declination) * r,
			Math.cos(declination) * r,
			Math.cos(ascension) * Math.sin(declination) * r
		];
	},
	// Turn for x (0), y (1) or z (2) axis
	rotateForAxis: function(axis, coor, angle) {
		angle = this.degreesToRadians(angle);
		let coorStatic = coor.splice(axis, 1)[0];
		let c1 = coor[0];
		let c2 = coor[1];

		coor = [
			Math.cos(angle) * c1 - Math.sin(angle) * c2,
			Math.sin(angle) * c1 + Math.cos(angle) * c2
		];

		coor.splice(axis, 0, coorStatic);

		return coor;
	 },
	// Turn for all axis rotations
	rotate: function(coor, rotateA) {
		return this.rotateForAxis(
			2, 
			this.rotateForAxis(
				1, 
				this.rotateForAxis(
					0, 
					coor,
					rotateA[0]
				),
				rotateA[1]
			), 
			rotateA[2]
		);
	},
	// TODO -> Move all the math into here.
});
