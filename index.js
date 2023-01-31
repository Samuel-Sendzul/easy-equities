var auth = require("./src/auth");
var accounts = require("./src/accounts");

const username = process.env.username;
const password = process.env.password;

auth.login(username, password).then(() => accounts.valuations("413392"));
