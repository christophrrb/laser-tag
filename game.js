var radius = 6371009
class Player{
	constructor(lat,long, direction) {
		this.lat = lat;
		this.long = long;
		this.direction = direction;
	}	
}
function getDistance(player1,player2){
	var distanceLat =Math.abs(player1.lat - player2.lat);
	console.log(distanceLat);
	var distanceLong =Math.abs(player1.long - player2.long);
	console.log(distanceLong);
	var distance = radius*Math.sqrt(Math.pow(distanceLat,2)+ Math.pow(Math.cos((player1.lat+player2.lat)/2)*(distanceLong),2))
	console.log(distance);
	return distance;
}
function angleTo(player1,player2){
	var distanceLat = radius*Math.sqrt(Math.pow((Math.abs(player1.lat - player2.lat)),2));
	console.log(distanceLat);
	var distanceLong = radius*Math.sqrt(Math.pow(Math.cos((player1.lat+player2.lat)/2)*(Math.abs(player1.long - player2.long)),2))
	console.log(distanceLong);
	var angle = Math.atan(distanceLong/distanceLat)*(180/Math.PI);
	console.log(angle);
	return angle;
	
}
var Denis = new Player(.5920438712468366,-1.471965699643422,0)
console.log(Denis.lat+""+Denis.long+""+Denis.direction);
var Jack = new Player(.5920422887568039,-1.471964335145013,.001)
console.log(Jack.lat+""+Jack.long+""+Jack.direction);
getDistance(Denis,Jack);
angleTo(Denis,Jack);
