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
	//	resolution: "detailed",
		title: true, //Whether or not the Moon Phase Title is displayed
		phase: true, //Label for what moon phase it is
		x: "200",
		y: "200"
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

		// create element wrapper for show into the module
		let wrapper = document.createElement("div");
		wrapper.id = "moonphase-wrapper";
		let title   = document.createElement("p");
		title.id    = "moonphase-title";
		//title.style.borderBottom = "1px solid white";
		if(this.config.title) {title.innerHTML = this.translate("TITLE");}else{title.style.display="none";}
		let moonCanvas = document.createElement("canvas");
		moonCanvas.id  = "moonphase-canvas";
		moonCanvas.height = this.config.y;
		moonCanvas.width = this.config.x;
		moonCanvas.style.background = "url('https://github.com/NolanKingdon/MMM-MoonPhase/blob/master/images/Phases/full.png?raw=true')";
		moonCanvas.style.backgroundSize = "cover";
		let phase   = document.createElement("p");
		phase.id    = "moonphase-phase";
		if(!this.config.phase){phase.style.display = "none";}
		this.drawCanvas(moonCanvas, phase);
		//Appending our empty elements to the DOM object
		wrapper.appendChild(title);
		wrapper.appendChild(moonCanvas);
		wrapper.appendChild(phase);
		return wrapper;
	},

	drawCanvas: function(canvas, phase){
		let ctx = canvas.getContext("2d");
		const X = parseInt(this.config.x);
        	const Y = parseInt(this.config.y);
		const BEZ_HEIGHT = Y/10;

		let day = this.calculatePhase();
		let roundedDay = Math.floor(day);
		//There's definitely a better way to do this.
		if(roundedDay == 0 || roundedDay == 29){
			phase.innerHTML = this.translate("NEW");
		}else if(roundedDay > 0 && roundedDay < 7){
			phase.innerHTML = this.translate("WAX_CRESC");
		}else if(roundedDay == 7) {
			phase.innerHTML = this.translate("FIRST");
		}else if(roundedDay > 7 && roundedDay < 15){
			phase.innerHTML = this.translate("WAX_GIB");
		}else if(roundedDay == 15){
			phase.innerHTML = this.translate("FULL");
		}else if(roundedDay > 15 && roundedDay < 22){
			phase.innerHTML = this.translate("WAN_GIB");
		}else if(roundedDay == 22) {
			phase.innerHTML = this.translate("THIRD");
		}else if(roundedDay > 22 && roundedDay < 29){
			phase.innerHTML = this.translate("WAN_CRESC");
		}

		let dayMod;

		if(day <= 15){
			dayMod = day;
		} else {
			dayMod = day%15;
		}
		let bezCover = X*1.15;
		let bezDif = bezCover - X/2;
		let step = 7;
		let bezX = bezCover-( bezDif / step * dayMod);

		if(day < 15 && day > 0){
			ctx.shadowOffsetX = 7;
			ctx.shadowColor = "black";
			ctx.shadowBlur = 10;
		}else if(day > 15 && day < 29){
			ctx.shadowOffsetX = -7;
			ctx.shadowColor = "black";
			ctx.shadowBlur = 10;
		}

		ctx.beginPath();
		ctx.moveTo(X/2, -10);
		ctx.bezierCurveTo(bezX, BEZ_HEIGHT, bezX, Y-BEZ_HEIGHT, X/2, Y+10);
		if(day <=15){
			ctx.lineTo(0,Y);
			ctx.lineTo(0,0);
			ctx.lineTo(X/2, 0);
			ctx.fill();
		} else {
			ctx.lineTo(X, Y);
			ctx.lineTo(X, 0);
			ctx.lineTo(X/2, 0);
			ctx.fill();
		}
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

	calculatePhase: function(){
		//Formula from here: https://www.subsystems.us/uploads/9/8/9/4/98948044/moonphase.pdf
		//Getting Current Date
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
		return dayOfCycle;
	},
	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "MMM-MoonPhase-PHASE-RECIEVED") {
			this.updateDom();
		}
	},
});
