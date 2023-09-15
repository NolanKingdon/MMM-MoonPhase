/* MagicMirror²
 * Node Helper: MMM-MoonPhase
 *
 * By Nolan Kingdon
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const moment = require("moment");

module.exports = NodeHelper.create({
	socketNotificationReceived: function(notification, payload) {
		switch(notification) {
			case 'CALCULATE_MOONDATA':
				const data = this.getMoonPhase(payload.x/2);
				this.sendSocketNotification('CURRENT_MOONDATA', data);
				break;
            case 'CALCULATE_MOONTIMES':
                const times = this.getMoonTimes(payload.gmtOffset, payload.lon, payload.lat).trim().split(' ');
                // TODO 
                // - Make a readable time format.
                // - Check to see if there's a 24 hour config in core MM?
                // - Check to see if you can grab moment from here
                this.sendSocketNotification('CURRENT_MOONTIMES', {
                    rise: this._formatTime(global.config.timeFormat, times[0]),
                    set: this._formatTime(global.config.timeFormat, times[1])
                });
                break;
			default:
				console.error('Unexpected notification', notification, payload);
				break;
		}
	},
    /***********************
     * Moonphase Functions *
     ***********************/
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

    /***************************
     * Moon rise/set Functions *
     ***************************/
    _formatTime: function(hourScheme, time) {
        if(time.length !== 4) {
            console.error("Invalid time provided");
            return;
        }

        let hours = time.substr(0,2);
        let context = "";
        const mins = time.substr(2,time.length);

        if(hourScheme === 12) {
            // Will drop leading 0
            hours = parseInt(hours); 
            context = " am";

            if(hours > 12) {
                hours = hours % 12;
                context = " pm";
            }
        }

        return `${hours}:${mins}${context}`;
    },
    getMoonTimes: function(gmt, lon, lat) {
        // Code is originally from an app by Sir Keith Burnett with small modifications made to make it work
        // in the MM framework. Comments are from the original source.
        //
        // Original code can be found here:
        // https://web.archive.org/web/20050609012142/http://www.xylem.f2s.com/kepler/js_sunrise_moonrise.html
        //
        // More information on calculating moon rise and set here:
        // https://www.stjarnhimlen.se/comp/riset.html#4
        meanJulianDays = this._getMeanJulianDays();
        return this._calculateMoonRiseAndSet(meanJulianDays, gmt, lon, lat);
    },
    _getMeanJulianDays: function() {
        let a, b;

        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const year = today.getFullYear();
        const hour = 0.0;

        if (month <= 2) {
            month = month + 12;
            year = year - 1;
        }
        a = 10000.0 * year + 100.0 * month + day;
        if (a <= 15821004.1) {
            b = -2 * Math.floor((year + 4716)/4) - 1179;
        }
        else {
            b = Math.floor(year/400) - Math.floor(year/100) + Math.floor(year/4);
        }
        a = 365.0 * year - 679004.0;
        return (a + b + Math.floor(30.6001 * (month + 1)) + day + hour/24.0);
    },
    _calculateMoonRiseAndSet: function(mjd, tz, glong, glat) {
        var sglong, sglat, date, ym, yz, above, utrise, utset, j;
        var yp, nz, rise, sett, hour, z1, z2, iobj, rads = 0.0174532925;
        var quadout = new Array;
        var sinho;
        var always_up = " ****";
        var always_down = " ....";
        var outstring = "";

        sinho = Math.sin(rads * 8/60);		//moonrise taken as centre of moon at +8 arcmin
        sglat = Math.sin(rads * glat);
        cglat = Math.cos(rads * glat);
        date = mjd - tz/24;
        rise = false;
        sett = false;
        above = false;
        hour = 1.0;
        ym = this._sinAlt(1, date, hour - 1.0, glong, cglat, sglat) - sinho;

        if (ym > 0.0) above = true;
        while(hour < 25 && (sett == false || rise == false)) {
            yz = this._sinAlt(1, date, hour, glong, cglat, sglat) - sinho;
            yp = this._sinAlt(1, date, hour + 1.0, glong, cglat, sglat) - sinho;
            quadout = this._quad(ym, yz, yp);
            nz = quadout[0];
            z1 = quadout[1];
            z2 = quadout[2];
            xe = quadout[3];
            ye = quadout[4];

            // case when one event is found in the interval
            if (nz == 1) {
                if (ym < 0.0) {
                    utrise = hour + z1;
                    rise = true;
                }
                else {
                    utset = hour + z1;
                    sett = true;
                }
            } // end of nz = 1 case

            // case where two events are found in this interval
            // (rare but whole reason we are not using simple iteration)
            if (nz == 2) {
                if (ye < 0.0) {
                    utrise = hour + z2;
                    utset = hour + z1;
                }
                else {
                    utrise = hour + z1;
                    utset = hour + z2;
                }
            }

            // set up the next search interval
            ym = yp;
            hour += 2.0;

        } // end of while loop

        if (rise == true || sett == true ) {
            if (rise == true) outstring += " " + this._hrsmin(utrise);
            else outstring += " ----";
            if (sett == true) outstring += " " + this._hrsmin(utset);
            else outstring += " ----";
        }
        else {
            if (above == true) outstring += always_up + always_up;
            else outstring += always_down + always_down;
        }

        return outstring;
    },
    _sinAlt: function(iobj, mjd0, hour, glong, cglat, sglat) {
        var mjd, t, ra, dec, tau, salt, rads = 0.0174532925;
        var objpos = new Array;
        mjd = mjd0 + hour/24.0;
        t = (mjd - 51544.5) / 36525.0;
        if (iobj == 1) {
            objpos = this._miniMoon(t);
        }
        else {
            objpos = minisun(t);
        }
        ra = objpos[2];
        dec = objpos[1];
        // hour angle of object
        tau = 15.0 * (this._lmst(mjd, glong) - ra);
        // sin(alt) of object using the conversion formulas
        salt = sglat * Math.sin(rads*dec) + cglat * Math.cos(rads*dec) * Math.cos(rads*tau);
        return salt;
    },
    _miniMoon: function(t) {
        var p2 = 6.283185307, arc = 206264.8062, coseps = 0.91748, sineps = 0.39778;
        var L0, L, LS, F, D, H, S, N, DL, CB, L_moon, B_moon, V, W, X, Y, Z, RHO;
        var mooneq = new Array;

        L0 = this._frac(0.606433 + 1336.855225 * t);	// mean longitude of moon
        L = p2 * this._frac(0.374897 + 1325.552410 * t) //mean anomaly of Moon
        LS = p2 * this._frac(0.993133 + 99.997361 * t); //mean anomaly of Sun
        D = p2 * this._frac(0.827361 + 1236.853086 * t); //difference in longitude of moon and sun
        F = p2 * this._frac(0.259086 + 1342.227825 * t); //mean argument of latitude

        // corrections to mean longitude in arcsec
        DL =  22640 * Math.sin(L)
        DL += -4586 * Math.sin(L - 2*D);
        DL += +2370 * Math.sin(2*D);
        DL +=  +769 * Math.sin(2*L);
        DL +=  -668 * Math.sin(LS);
        DL +=  -412 * Math.sin(2*F);
        DL +=  -212 * Math.sin(2*L - 2*D);
        DL +=  -206 * Math.sin(L + LS - 2*D);
        DL +=  +192 * Math.sin(L + 2*D);
        DL +=  -165 * Math.sin(LS - 2*D);
        DL +=  -125 * Math.sin(D);
        DL +=  -110 * Math.sin(L + LS);
        DL +=  +148 * Math.sin(L - LS);
        DL +=   -55 * Math.sin(2*F - 2*D);

        // simplified form of the latitude terms
        S = F + (DL + 412 * Math.sin(2*F) + 541* Math.sin(LS)) / arc;
        H = F - 2*D;
        N =   -526 * Math.sin(H);
        N +=   +44 * Math.sin(L + H);
        N +=   -31 * Math.sin(-L + H);
        N +=   -23 * Math.sin(LS + H);
        N +=   +11 * Math.sin(-LS + H);
        N +=   -25 * Math.sin(-2*L + F);
        N +=   +21 * Math.sin(-L + F);

        // ecliptic long and lat of Moon in rads
        L_moon = p2 * this._frac(L0 + DL / 1296000);
        B_moon = (18520.0 * Math.sin(S) + N) /arc;

        // equatorial coord conversion - note fixed obliquity
        CB = Math.cos(B_moon);
        X = CB * Math.cos(L_moon);
        V = CB * Math.sin(L_moon);
        W = Math.sin(B_moon);
        Y = coseps * V - sineps * W;
        Z = sineps * V + coseps * W
        RHO = Math.sqrt(1.0 - Z*Z);
        dec = (360.0 / p2) * Math.atan(Z / RHO);
        ra = (48.0 / p2) * Math.atan(Y / (X + RHO));
        if (ra <0 ) ra += 24;
        mooneq[1] = dec;
        mooneq[2] = ra;
        return mooneq;
    },
    _frac: function(x) {
        //
        //	returns the fractional part of x as used in minimoon and minisun
        //
        var a;
        a = x - Math.floor(x);
        if (a < 0) a += 1;
        return a;
    },
    _lmst: function(mjd, glong) {
        //
        //	Takes the mjd and the longitude (west negative) and then returns
        //  the local sidereal time in hours. Im using Meeus formula 11.4
        //  instead of messing about with UTo and so on
        //
        var lst, t, d;
        d = mjd - 51544.5
        t = d / 36525.0;
        lst = this._range(280.46061837 + 360.98564736629 * d + 0.000387933 *t*t - t*t*t / 38710000);
        return (lst/15.0 + glong/15);
    },
    _range: function(x) {
        //
        //	returns an angle in degrees in the range 0 to 360
        //
        var a, b;
        b = x / 360;
        a = 360 * (b - this._ipart(b));
        if (a  < 0 ) {
            a = a + 360
        }
        return a
    },
    _ipart: function(x) {
        //
        //	returns the integer part - like int() in basic
        //
        var a;
        if (x> 0) {
            a = Math.floor(x);
        }
        else {
            a = Math.ceil(x);
        }
        return a;
    },
    _quad: function(ym, yz, yp) {
        //
        //	finds the parabola throuh the three points (-1,ym), (0,yz), (1, yp)
        //  and returns the coordinates of the max/min (if any) xe, ye
        //  the values of x where the parabola crosses zero (roots of the quadratic)
        //  and the number of roots (0, 1 or 2) within the interval [-1, 1]
        //
        //	well, this routine is producing sensible answers
        //
        //  results passed as array [nz, z1, z2, xe, ye]
        //
        var nz, a, b, c, dis, dx, xe, ye, z1, z2, nz;
        var quadout = new Array;

        nz = 0;
        a = 0.5 * (ym + yp) - yz;
        b = 0.5 * (yp - ym);
        c = yz;
        xe = -b / (2 * a);
        ye = (a * xe + b) * xe + c;
        dis = b * b - 4.0 * a * c;
        if (dis > 0)	{
            dx = 0.5 * Math.sqrt(dis) / Math.abs(a);
            z1 = xe - dx;
            z2 = xe + dx;
            if (Math.abs(z1) <= 1.0) nz += 1;
            if (Math.abs(z2) <= 1.0) nz += 1;
            if (z1 < -1.0) z1 = z2;
        }
        quadout[0] = nz;
        quadout[1] = z1;
        quadout[2] = z2;
        quadout[3] = xe;
        quadout[4] = ye;
        return quadout;
    },
    _hrsmin: function(hours) {
        //
        //	takes decimal hours and returns a string in hhmm format
        //
        var hrs, h, m, dum;
        hrs = Math.floor(hours * 60 + 0.5)/ 60.0;
        h = Math.floor(hrs);
        m = Math.floor(60 * (hrs - h) + 0.5);
        dum = h*100 + m;
        //
        // the jiggery pokery below is to make sure that two minutes past midnight
        // comes out as 0002 not 2. Javascript does not appear to have 'format codes'
        // like C
        //
        if (dum < 1000) dum = "0" + dum;
        if (dum <100) dum = "0" + dum;
        if (dum < 10) dum = "0" + dum;
        return dum;
    }
});
