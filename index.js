var auth = require("./src/auth");
var accounts = require("./src/accounts");
var instruments = require("./src/instruments")

const username = process.env.username;
const password = process.env.password;

auth.login(username, password).then(() => accounts.holdings("413392"));
