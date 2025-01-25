/* MagicMirror²
 * Module: MMM-MoonPhase
 *
 * By Nolan Kingdon
 * MIT Licensed.
 */

Module.register("MMM-MoonPhase", {
	requiresVersion: "2.1.0", // Required version of MagicMirror
	defaults: { 
		updateInterval: 43200000, // Every Twelve hours
		hemisphere: "N", // N or S
		resolution: "detailed", // Detailed Or basic
		basicColor: "#FFF", // If basic moon (shape only) is used, this is it's color
		title: true, // Whether or not the Moon Phase Title is displayed
		phase: true, // Label for what moon phase it is
		age: false, // Display the age of the moon cycle in days,
        phaseAge: false, // Display how many days the moon has been in it's current phase
        phaseAgeTotal: false, // When phaseAge = true, display how many total days are in a cycle
		nextFull: false,
        size: 200, // Represents the size of the moon
		x: 0, // Depreciated in 1.2 (Use size instead): x dimension of the moon's canvas
		y: 0, // Depreciated in 1.2 (Use size instead): y dimension of the moon's canvas
		alpha: 0.8, // Visibility of the moon behind the shadow - 1 is fully blacked out
        moonAlign: "center", // Where the moon aligns to (start/center/end)
        textAlign: "center", // Where the content under the moon aligns to (start/center/end)
        riseAndSet: {
            display: false,
            lon: 0,
            lat: 0,
            gmtOffset: 0
        },
        sendNotifications: false
	},
	start: function() {
        if(this.config.title) this.data.header = this.translate("TITLE");

        // Gross hack until x/y is removed and the change is propagated everywhere.
        // Stops us from having to check every time.
        if(this.config.x === 0) this.config.x = this.config.size;
        if(this.config.y === 0) this.config.y = this.config.size;

		this.moonData = {
			points: [],
			jDate: []
		};
        this.moonTimes = {
            rise: 0,
            set: 0
        };
		this.sendSocketNotification('CALCULATE_MOONDATA', this.config);
		if(this.config.riseAndSet.display) {
            this.sendSocketNotification('CALCULATE_MOONTIMES', this.config.riseAndSet);
        }

		// Schedule update timer.
		setInterval(() => {
			this.sendSocketNotification('CALCULATE_MOONDATA', this.config);
            if( this.config.riseAndSet.display ) {
                this.sendSocketNotification('CALCULATE_MOONTIMES', this.config.riseAndSet);
            }
		}, this.config.updateInterval);
	},
	getStyles: function () {
		return [
			"MMM-MoonPhase.css",
		];
	},
	getTranslations: function() {
		/* If adding translations for the module,
		 * add the reference to the json file you
		 * created here!
		 */
		return {
			en: "translations/en.json",
			de: "translations/de.json",
			fr: "translations/fr.json",
			sv: "translations/sv.json",
			es: "translations/es.json",
			gr: "translations/gr.json",
			el: "translations/gr.json",
			pl: "translations/pl.json",
			it: "translations/it.json",
			pt: "translations/pt-br.json",
			ru: "translations/ru.json",
			cs: "translations/cs.json",
			nl: "translations/nl.json"
		};
	},
	socketNotificationReceived: function (notification, payload) {
        switch(notification) {
            case 'CURRENT_MOONDATA':
                this.moonData = payload;
                this.updateDom();
                break;
            case 'CURRENT_MOONTIMES':
                this.moonTimes = payload;
                this.updateDom()
                break;
            default:
                break;
        }
	},
	getDom: function() {
		const wrapper = document.createElement("div");
		const jDate = this.moonData.jDate;
		wrapper.id = "moonphase-wrapper";

		const moonCanvas = document.createElement("canvas");
		moonCanvas.id = "moonphase-canvas";
		moonCanvas.height = this.config.y;
		moonCanvas.width = this.config.x;
        moonCanvas.style.alignSelf = this.config.moonAlign;

		if (this.config.resolution === "detailed"){
			moonCanvas.style.background = "url('modules/MMM-MoonPhase/public/Phases/full.png?raw=true')";
			moonCanvas.style.backgroundSize = "cover";
		}

		const phase = document.createElement("p");
		phase.id = "moonphase-phase";
        phase.style.alignSelf = this.config.textAlign;

        let phaseText = "";
        let phaseAge = [0, 0]; // day (phaseAge[0]) of total (phaseAge[1])

		if (jDate[1] <= 1 || jDate[1] >= 29){
            phaseText = "NEW";
            // Hardcode for simplicity
            phaseAge = jDate[1] >= 29 ? [ 1, 2 ] : [ 2, 2 ]
		} else if (jDate[1] > 1 && jDate[1] < 7){
            phaseText = "WAX_CRESC";
            // Phase age starts at 1, 
            phaseAge = [ Math.floor(jDate[1]), 6 ];
		} else if (jDate[1] >= 7 && jDate[1] <= 8) {
            phaseText = "FIRST";
            phaseAge = [ Math.floor(jDate[1] - 6), 2 ];
		} else if (jDate[1] > 8 && jDate[1] < 14){
            phaseText = "WAX_GIB";
            phaseAge = [ Math.floor(jDate[1] - 8), 5 ];
		} else if (jDate[1] >= 14 && jDate[1] < 16){
            phaseText = "FULL";
            phaseAge = [ Math.floor(jDate[1] - 13), 2 ];
		} else if (jDate[1] >= 16 && jDate[1] <= 21){
            phaseText = "WAN_GIB";
            phaseAge = [ Math.floor(jDate[1] - 15), 6 ];
		} else if (jDate[1] >= 22 && jDate[1] <= 23) {
            phaseText = "THIRD";
            phaseAge = [ Math.floor(jDate[1] - 21), 2 ];
		} else if (jDate[1] > 23 && jDate[1] < 29){
            phaseText = "WAN_CRESC";
            phaseAge = [ Math.floor(jDate[1] - 23), 5 ];
		}

        phase.innerHTML = this.translate(phaseText);

		if (!this.config.phase){ 
			phase.style.display = "none";
		}

		const age = document.createElement("p");
		age.id  = "moonphase-age";
        age.style.alignSelf = this.config.textAlign;
		age.innerHTML = Math.round(jDate[1]) + " " + this.translate("DAYS");

		if (!this.config.age){ 
			age.style.display = "none";
		}

		this.drawCanvas(moonCanvas);

        const phaseAgeText = document.createElement("p");
        phaseAgeText.id = "moonphase-phase-age";
        phaseAgeText.style.alignSelf = this.config.textAlign;

        phaseAgeText.innerHTML = this.config.phaseAgeTotal 
            ? `${phaseAge[0]} / ${phaseAge[1]} ${this.translate('DAYS')}`
            : `${phaseAge[0]} ${this.translate('DAYS')}`;

        if(!this.config.phaseAge) {
            phaseAgeText.style.display = "none";
        }
        
		// Appending our elements to the DOM object
		wrapper.appendChild(moonCanvas);
		wrapper.appendChild(phase);
		wrapper.appendChild(age);
        wrapper.appendChild(phaseAgeText);

        // Moon Rise/Set Times
        if(this.config.riseAndSet.display) {
            const times = document.createElement("div");
            times.id = "moonrise-container";
            times.innerHTML = `
                <div><span class="fas fa-chevron-up"></span>${this.moonTimes.rise}</div>
                <div>${this.moonTimes.set}<span class="fas fa-chevron-down"></span></div>
            `;
            times.style.alignSelf = this.config.textAlign;

            wrapper.appendChild(times);
        }

        if(this.config.sendNotifications && phaseText !== "") {
            let payload = {
                moonphase: phaseText.toLowerCase()
            }

            this.sendNotification("COMPLIMENT_CONTEXT", payload);
        }

		if(this.config.nextFull) {
			const fullStart = 14;
			const daysInPhase = jDate[1];
			const daysInCycle = 29.3;
			const nextFullMoon = document.createElement("p");
			const daysUntilFull = Math.round((fullStart - daysInPhase + daysInCycle) % daysInCycle);
			const displayDays = daysUntilFull > 0 ? daysUntilFull : 29;

			nextFullMoon.innerHTML = `${this.translate("NEXT_FULL")}: ${displayDays} ${this.translate("DAYS")}`;
			nextFullMoon.id = "next-full-moon";
			nextFullMoon.style.alignSelf = this.config.textAlign;
			
			wrapper.appendChild(nextFullMoon);
		}

		return wrapper;
	},
	drawCanvas: function(canvas){
		const jDate = this.moonData.jDate;
		const ctx = canvas.getContext("2d");
		this.drawAxisCircles(jDate, ctx);

		// Transforming the moon image to align with the southern hemisphere
		if (this.config.hemisphere.toUpperCase() === "S"){
			canvas.style.transform = "rotate(180deg)";
		}
	},
	drawAxisCircles: function(jDate, ctx) {
		ctx.clearRect(0, 0, this.config.x, this.config.y);

		if (this.config.resolution === "basic"){
			ctx.beginPath();
			ctx.fillStyle = this.config.basicColor;
			ctx.arc(this.config.x/2, this.config.y/2, this.config.x/2, 1.5*Math.PI, 3.5 * Math.PI);
			ctx.fill();
			// Have to move back the cursor to not have interfering lines
			ctx.moveTo(this.config.x/2, this.config.y);
			ctx.closePath();
		}

		ctx.beginPath();

		// Draw curve
		for (i=0; i<this.moonData.points.length; i++) {
			ctx.fillStyle = "rgba(0,0,0, " + this.config.alpha + ")";
			this.drawPoint(
				this.moonData.points[i],
				ctx
			);
		}

		// Fill shadow
		if (jDate[1] < 15){ // We are in waxing phases
			// ClockWise
			ctx.arc(
				this.config.x/2,
				this.config.y/2,
				this.config.x/2,
				0.5*Math.PI,
				1.5*Math.PI
			);
			ctx.fill();
		} else if (jDate[1] >= 15){
			// Arc counter clckwise
			ctx.arc(
				this.config.x/2,
				this.config.y/2,
				this.config.x/2,
				0.5*Math.PI,
				1.5*Math.PI,
				true
			);
			ctx.fill();
		}
	},
	drawPoint: function(coor, ctx){
		// If the points z coordinate is less than
		// zero, it is out of view thus, grey.
		let color = "transparent";
		if (coor[2] >= 0) {
			color = "rgba(0,0,0, " + this.config.alpha + ")";
		}
		ctx.fillStyle = color;
		ctx.lineTo(this.config.x/2 + coor[0], this.config.y/2 - coor[1]);
		ctx.stroke();
	},
});
