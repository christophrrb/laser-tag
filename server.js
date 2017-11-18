const connect = require('connect');
const serverStatic = require('serve-static');

const port = process.env.PORT || process.env.port || 8080;

connect().use(serverStatic(__dirname)).listen(port);
var geomagnetism = require('geomagnetism');
var info = geomagnetism.model().point([Denis.lat,Denis.long]);
console.log('declination:', info.decl);