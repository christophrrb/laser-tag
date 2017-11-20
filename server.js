var geomagnetism = require('geomagnetism');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var server = require('http').createServer(handler)
var io = require('socket.io')(server);
var fs = require('fs');
var mysql = require('mysql');
var connection = mysql.createConnection({
	host: "mysql://bcb2263ddffcb7:be231aa8@us-cdbr-iron-east-05.cleardb.net/heroku_37fdbc5a8e62d55?reconnect=true",
	user: "bcb2263ddffcb7",
	password: "be231aa8"
});
connection.connect(function (err) {
	if (!err) {
		console.log("Database is connected ... \n\n");
	} else {
		console.log("Error connecting database ... \n\n");
	}
});
server.listen(process.env.PORT || process.env.port || 8080);
class Player {
	constructor(lat, long, heading, name) {
		this.lat = lat;
		this.long = long;
		this.heading = heading;
		this.trueHeading;
		this.name = name
	}
}
function toRad(n) {
	return n * Math.PI / 180;
};
function toDeg(n) {
	return n * 180 / Math.PI;
};
function distVincenty(player1, player2) {
	var lat1 = player1.lat;
	var lat2 = player2.lat;
	var lon1 = player1.lon;
	var lon2 = player2.lon;
	var a = 6378137,
		b = 6356752.3142,
		f = 1 / 298.257223563, // WGS-84 ellipsoid params
		L = toRad(lon2 - lon1),
		U1 = Math.atan((1 - f) * Math.tan(toRad(lat1))),
		U2 = Math.atan((1 - f) * Math.tan(toRad(lat2))),
		sinU1 = Math.sin(U1),
		cosU1 = Math.cos(U1),
		sinU2 = Math.sin(U2),
		cosU2 = Math.cos(U2),
		lambda = L,
		lambdaP,
		iterLimit = 100;
	do {
		var sinLambda = Math.sin(lambda),
			cosLambda = Math.cos(lambda),
			sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
		if (0 === sinSigma) {
			return 0; // co-incident points
		};
		var cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda,
			sigma = Math.atan2(sinSigma, cosSigma),
			sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma,
			cosSqAlpha = 1 - sinAlpha * sinAlpha,
			cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha,
			C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
		if (isNaN(cos2SigmaM)) {
			cos2SigmaM = 0; // equatorial line: cosSqAlpha = 0 (§6)
		};
		lambdaP = lambda;
		lambda = L + (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
	} while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0);

	if (!iterLimit) {
		return NaN; // formula failed to converge
	};

	var uSq = cosSqAlpha * (a * a - b * b) / (b * b),
		A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq))),
		B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq))),
		deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM))),
		s = b * A * (sigma - deltaSigma);
	return s.toFixed(3); // round to 1mm precision
};
function angleTo(player1, player2) {
	var lat1 = player1.lat
	var lat2 = player2.lat
	var lng1 = player1.long
	var lng2 = player2.long
	var dLon = this.toRad(lng2 - lng1);
	var y = Math.sin(dLon) * Math.cos(this.toRad(lat2));
	var x = Math.cos(this.toRad(lat1)) * Math.sin(this.toRad(lat2)) - Math.sin(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.cos(dLon);
	var brng = this.toDeg(Math.atan2(y, x));
	return ((brng + 360) % 360);
}
function isPointing(player1, player2) {
	var angle = angleTo(player1, player2);
	if (angle > 15 && angle < 345) {
		if (angle - 10 < player1.trueHeading == player1.trueHeading < angle + 10) {
			return true;
		} else {
			return false;
		}
	} else if (angle <= 15) {
		angle = angle + 15
		if (angle - 10 < player1.trueHeading + 15 == player1.trueHeading + 15 < angle + 10) {
			return true;
		} else {
			return false;
		}
	} else {
		angle = angle - 15
		if (angle - 10 < player1.trueHeading - 15 == player1.trueHeading - 15 < angle + 10) {
			return true;
		} else {
			return false;
		}
	}

}
function trueHeading(player) {
	var info = geomagnetism.model().point([player.lat, player.long]);
	player.trueHeading = player.heading + info.declination;
	return player.trueHeading;
}
function handler(req, res) {
	fs.readFile(__dirname + '/index.html',
		function (err, data) {
			if (err) {
				res.writeHead(500);
				return res.end('Error loading index.html');
			}

			res.writeHead(200);
			res.end(data);
		});
}
io.on('connection', function (socket) {
	socket.on('buttonPress', function (data) {
		console.log(data);
	});
});
