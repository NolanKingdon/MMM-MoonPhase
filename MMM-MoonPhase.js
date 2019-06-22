/* global Module */

/* Magic Mirror
 * Module: MMM-MoonPhase
 *
 * By Nolan Kingdon
 * MIT Licensed.
 */

Module.register("MMM-MoonPhase", {
	defaults: { //TODOs - Commented out
		updateInterval: 43200000, // Every Twelve hours
		hemisphere: "N", //N or S
		resolution: "detailed", // detailed Or basic
		basicColor: "#ffffbe", // White is a good one
		title: true, //Whether or not the Moon Phase Title is displayed
		phase: true, //Label for what moon phase it is
		x: 200, // x dimension
		y: 200, // y dimension - I really recommend this staays the same as x, but whatever, go nuts
		alpha: 0.9 // not yet implemented - visibility of the moon behind the shadow - 1 is fully blacked out
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		var self = this;
		var dataRequest = null;
		var dataNotification = null;

		//Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.

		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);
	},

	getDom: function() {
		var self = this;

		// create element wrapper
		let wrapper = document.createElement("div");
		wrapper.id = "moonphase-wrapper";
		let title   = document.createElement("p");
		title.id    = "moonphase-title";
		// If title is turned on - Create Title
		if(this.config.title) {
			title.innerHTML = this.translate("TITLE");
		} else {
			title.style.display="none";
		}
		// Create Canvas
		let moonCanvas = document.createElement("canvas");
		moonCanvas.id  = "moonphase-canvas";
		moonCanvas.height = this.config.y;
		moonCanvas.width = this.config.x;
		//Adding in the background img
		if(this.config.resolution == "detailed"){
			moonCanvas.style.background = "url('https://github.com/NolanKingdon/MMM-MoonPhase/blob/master/images/Phases/full.png?raw=true')";
			moonCanvas.style.backgroundSize = "cover";	
		}		
		//Adding in our moon phase for below the moon
		let phase   = document.createElement("p");
		phase.id    = "moonphase-phase";
	
		if(!this.config.phase){ // Hiding the title if turned off in config
			phase.style.display = "none";
		}
		//Drawing on the existing canvas
		this.drawCanvas(phase, moonCanvas);
		//Appending our elements to the DOM object
		wrapper.appendChild(title);
		wrapper.appendChild(moonCanvas);
		wrapper.appendChild(phase);
		return wrapper;
	},

	drawPoint: function(coor, ctx){
		// If the points z coordinate is less than
		// zero, it is out of view thus, grey.
		if (coor[2] >= 0) color = "rgba(0,0,0, " + this.config.alpha + ")";
		else color = "transparent";
		ctx.fillStyle = color;
		ctx.lineTo(this.config.x/2 + coor[0], this.config.y/2 - coor[1]);
		ctx.stroke();
	},
	
    // Degree to radians
	radians: function(angle) {
		return angle * (Math.PI / 180);
	},
	
	// Convert spherical coordinate to x y z coordinate
	sphericalToPoint: function(ascension, declination) {
		ascension = this.radians(ascension);
		declination = this.radians(declination);
		return [
			Math.sin(ascension) * Math.sin(declination) * r,
			Math.cos(declination) * r,
			Math.cos(ascension) * Math.sin(declination) * r
		];
	},
	
	// Turn for x (0), y (1) or z (2) axis
	rotateForAxis: function(axis, coor, angle) {
		angle = this.radians(angle);
		static = coor.splice(axis, 1)[0];
		c1 = coor[0];
		c2 = coor[1];

		coor = [
			Math.cos(angle) * c1 - Math.sin(angle) * c2,
			Math.sin(angle) * c1 + Math.cos(angle) * c2
		];

		coor.splice(axis, 0, static);

		return coor;
	 },
	
	// Turn for all axis rotations
	rotate: function(coor) {
		return this.rotateForAxis(
			2, this.rotateForAxis(
				1, this.rotateForAxis(
					0, coor, rotate_a[0]), rotate_a[1]), rotate_a[2]);
	},
	
	// Draw three axis circles
	drawAxisCircles: function(jDate, ctx) {
		// Clear canvas
		ctx.clearRect(0, 0, this.config.x, this.config.y);
		
		
		//Applying blur to our stroke -- TODO - implement smoothly. Right now it ridges the shadow		
		/*if(jDate[1] < 15 && jDate[1] > 0){
			ctx.shadowOffsetX = 4;
			//ctx.shadowOffsetY = -10;
			ctx.shadowColor = "black";
			ctx.shadowBlur = 10;
		}else if(jDate[1] >= 16 && jDate[1] < 29){
			ctx.shadowOffsetX = -4;
			//ctx.shadowOffsetY = -0;
			ctx.shadowColor = "black";
			ctx.shadowBlur = 5;
		}*/
		
		if(this.config.resolution == "basic"){
			ctx.beginPath();
			ctx.fillStyle = this.config.basicColor;
			ctx.arc(this.config.x/2, this.config.y/2, this.config.x/2, 1.5*Math.PI, 3.5 * Math.PI);
			ctx.fill();
			// Have to move back the cursor to not have interfering lines
			ctx.moveTo(this.config.x/2, this.config.y);
			ctx.closePath();
		} 
		
		ctx.beginPath();
		for (i = 0; i < 180; i += increase_by) {
			ctx.fillStyle = "rgba(0,0,0, " + this.config.alpha + ")";
			this.drawPoint(this.rotate(this.sphericalToPoint(90, i)), ctx);
		}
		console.log(jDate[1]);
		if(jDate[1] < 15){// We are in waxing phases
			ctx.lineTo(0, this.config.y);
			ctx.lineTo(0, 0);
			ctx.lineTo(this.config.x/2, 0);
			ctx.fill();
		} else if(jDate[1] >= 15){
			ctx.lineTo(this.config.x, this.config.y);
			ctx.lineTo(this.config.x, 0);
			ctx.lineTo(this.config.x/2, 0);
			ctx.fill();
		}
	},
	
	drawCanvas: function(phase, canvas){
		//let testDay = 10;
   	    let jDate = this.getMoonPhase(); //[testDay%15, testDay];

	    var d_canvas = canvas;//document.getElementById('canvas');
	    var ctx = d_canvas.getContext('2d');
	    increase_by = 2;
	    r = this.config.x/2; // radius
	    // Getting the percentage of the way through the moon cycle so we can use that percent to determing
	    // How far to draw the curve
	    rotate_a = [0, 360*(jDate[0]/29.5), 0]; // rotation angles
		
		//Starting the chain to draw the current curve of the moon
		
		/* NOTE - Math was heavily referenced from here:
		 * 
		 * https://medium.com/@refik/a-journey-and-a-method-for-drawing-spheres-5b24246ca479
		 * https://github.com/refik/rotate-sphere
		 * 
		 * A great writeup + the code tool he mentions in the article. These have been a great help
		 * to me.
		 */
		this.drawAxisCircles(jDate, ctx);
		
		//There's definitely a better way to do this.
		if(jDate[1] < 1 || jDate[1] > 29){
			phase.innerHTML = this.translate("NEW");
		}else if(jDate[1] > 1 && jDate[1] < 7){
			phase.innerHTML = this.translate("WAX_CRESC");
		}else if(jDate[1] >= 7 && jDate[1] <= 8) {
			phase.innerHTML = this.translate("FIRST");
		}else if(jDate[1] > 8 && jDate[1] < 14){
			phase.innerHTML = this.translate("WAX_GIB");
		}else if(jDate[1] > 14 && jDate[1] < 16){
			phase.innerHTML = this.translate("FULL");
		}else if(jDate[1] > 16 && jDate[1] < 21){
			phase.innerHTML = this.translate("WAN_GIB");
		}else if(jDate[1] >= 22 && jDate[1] <= 23) {
			phase.innerHTML = this.translate("THIRD");
		}else if(jDate[1] > 23 && jDate[1] < 29){
			phase.innerHTML = this.translate("WAN_CRESC");
		}

	
		// Transforming the moon image to align with the southern hemisphere
		if(this.config.hemisphere.toUpperCase() === "S"){canvas.style.transform = "rotate(180deg)";}

	},

	getStyles: function () {
		return [
			"MMM-MoonPhase.css",
		];
	},

	// Load translations files
	getTranslations: function() {
		//FIXME: This can be load a one file javascript definition
		return {
			en: "translations/en.json",
			es: "translations/es.json"
		};
	},

	getMoonPhase: function(){ // Gets the current Julian date
		const currDate = new Date();
		let d = currDate.getDate();
		let m = currDate.getMonth()+1;
		let y = currDate.getFullYear();

		//Adjusting as per our formula found above
		if(m === 1 || m === 2){
		  y = y-1;
		  m = m + 12;
		}

		//Formula to determine number of new moons Julian dates
		let a   = y/100;
		let b   = a/4;
		let c   = 2-a+b;
		let e   = 365.25 * (y+4716);
		let f   = 30.6001 * (m+1);
		let jd  = c + d + e + f - 1524.5;
		let daysSinceNew  = jd - 2451549.5;
		let newMoons      = daysSinceNew / 29.53;
		let moonFraction  = "0." + newMoons.toString().split(".")[1];
		//Our final Digit - 29.53 days a moon cycle. 15 is full moon. 0/29.5 is new
		let dayOfCycle    = parseFloat(moonFraction * 29.53);
		let dayOfCycleMod = dayOfCycle%15; // Allows us to utilize the 180deg math below --> Use the same curve twice = less calc
		//Returning our modded day AND our actual day
		return [dayOfCycleMod, dayOfCycle];
  },
	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "MMM-MoonPhase-PHASE-RECIEVED") {
			this.updateDom();
		}
	},
});
