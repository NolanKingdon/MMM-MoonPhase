/* global Module */

/* Magic Mirror
 * Module: MMM-MoonPhase
 *
 * By Nolan Kingdon
 * MIT Licensed.
 */

Module.register("MMM-MoonPhase", {
	defaults: { //TODOs - Commented out
		updateInterval: 43200000,
	//	hemisphere: "North",
	//	resolution: "detailed",
	//	language:   "en",
		title: true, //Whether or not the Moon Phase Title is displayed
		phase: true, //Label for what moon phase it is
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
		let title   = document.createElement("p");
		title.id    = "moonphase-title";
		if(this.config.title) {title.innerHTML = this.translate("TITLE");}
		let moonImg = document.createElement("img");
		moonImg.id  = "moonphase-img";
		let phase   = document.createElement("p");
		phase.id    = "moonphase-phase";
		if(!this.config.phase){phase.style.display = "none";}

		let moonPhase = this.calculatePhase();
		moonPhase = Math.round(moonPhase);
		let timestamp = new Date();
		//TODO - reduce this to numeric file names to condense this
		if(moonPhase === 0 || moonPhase === 29) {
			moonImg.src = 'modules/MMM-MoonPhase/images/Phases/new.png' + '?seed=' + timestamp;
			phase.innerHTML = this.translate("NEW");
		} else if (moonPhase === 1){
			moonImg.src = 'modules/MMM-MoonPhase/images/Phases/waxing-cresc-1.png' + '?seed=' + timestamp;
			phase.innerHTML = this.translate("WAX_CRESC");
		} else if (moonPhase === 2){
			moonImg.src = 'modules/MMM-MoonPhase/images/Phases/waxing-cresc-2.png' + '?seed=' + timestamp;
			phase.innerHTML = this.translate("WAX_CRESC");
		}else if (moonPhase === 3){
			moonImg.src = 'modules/MMM-MoonPhase/images/Phases/waxing-cresc-3.png' + '?seed=' + timestamp;
			phase.innerHTML = this.translate("WAX_CRESC");
		}else if (moonPhase === 4){
			moonImg.src = 'modules/MMM-MoonPhase/images/Phases/waxing-cresc-4.png' + '?seed=' + timestamp;
			phase.innerHTML = this.translate("WAX_CRESC");
		}else if (moonPhase === 5){
			moonImg.src = 'modules/MMM-MoonPhase/images/Phases/waxing-cresc-5.png' + '?seed=' + timestamp;
			phase.innerHTML = this.translate("WAX_CRESC");
		}else if (moonPhase === 6){
			moonImg.src = 'modules/MMM-MoonPhase/images/Phases/waxing-cresc-6.png' + '?seed=' + timestamp;
			phase.innerHTML = this.translate("WAX_CRESC");
		}else if (moonPhase === 7){
			moonImg.src = 'modules/MMM-MoonPhase/images/Phases/first.png' + '?seed=' + timestamp;
			phase.innerHTML = this.translate("FIRST");
		}else if (moonPhase === 8 || moonPhase === 9){
			moonImg.src = 'modules/MMM-MoonPhase/images/Phases/waxing-gibbous-1.png' + '?seed=' + timestamp;
			phase.innerHTML = this.translate("WAX_GIB");
		}else if (moonPhase === 10){
			moonImg.src = 'modules/MMM-MoonPhase/images/Phases/waxing-gibbous-2.png' + '?seed=' + timestamp;
			phase.innerHTML = this.translate("WAX_GIB");
		}else if (moonPhase === 11 || moonPhase === 12){
			moonImg.src = 'modules/MMM-MoonPhase/images/Phases/waxing-gibbous-3.png' + '?seed=' + timestamp;
			phase.innerHTML = this.translate("WAX_GIB");
		}else if (moonPhase === 13){
			moonImg.src = 'modules/MMM-MoonPhase/images/Phases/waxing-gibbous-4.png' + '?seed=' + timestamp;
			phase.innerHTML = this.translate("WAX_GIB");
		}else if (moonPhase === 14){
			moonImg.src = 'modules/MMM-MoonPhase/images/Phases/waxing-gibbous-5.png' + '?seed=' + timestamp;
			phase.innerHTML = this.translate("WAX_GIB");
		}else if(moonPhase === 15){
			moonImg.src = 'modules/MMM-MoonPhase/images/Phases/full.png' + '?seed=' +  timestamp;
			phase.innerHTML = this.translate("FULL");
		}
		
		wrapper.appendChild(title);
		wrapper.appendChild(moonImg);
		wrapper.appendChild(phase);
		
		return wrapper;
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
