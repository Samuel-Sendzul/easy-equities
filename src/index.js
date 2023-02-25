var auth = require("./auth");
var accounts = require("./accounts");
var instruments = require("./instruments");
var constants = require("./constants");
var portfolio = require("./portfolio");

module.exports = {
  auth,
  accounts,
  instruments,
  constants,
  portfolio
};

username = process.env.username
password = process.env.password

const main  = async () => {
  const token = await auth.login(username, password)

  const rebalancingOrders = await portfolio.rebalancingOrders("413393", {
      "TFSA.ETFUSD": 0.1,
      "TFSA.STXEMG": 0.1,
      "TFSA.STXNDQ": 0.1,
      "TFSA.STX500": 0.2,
      "TFSA.SYGEU": 0.2,
      "TFSA.SYGCN": 0.2,
      "TFSA.SYGH": 0.1
  })

}

main().then()
