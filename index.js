var auth = require("./src/auth");
var accounts = require("./src/accounts");
var axios = require("axios");

httpClient = axios.create({ withCredentials: true });

const username = process.env.username;
const password = process.env.password;

auth
  .login(httpClient, username, password)
  .then((cookies) => accounts._getAccountOverviewPage(httpClient, cookies));
