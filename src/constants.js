
var auth = require("./auth")

module.exports = {
  // URLs
  EASY_EQUITIES_BASE_PLATFORM_URL: "https://platform.easyequities.io",
  PLATFORM_SIGN_IN_PATH: "/Account/SignIn",
  PLATFORM_ACCOUNT_OVERVIEW_PATH : "/AccountOverview",
  PLATFORM_CAN_USE_ACCOUNT_PATH : "/Menu/CanUseSelectedAccount",
  PLATFORM_UPDATE_CURRENCY_PATH : "/Menu/UpdateCurrency",
  PLATFORM_ACCOUNT_VALUATIONS_PATH : "/AccountOverview/GetTrustAccountValuations",
  PLATFORM_HOLDINGS_PATH : "/AccountOverview/GetHoldingsView?stockViewCategoryId:12",
  PLATFORM_TRANSACTIONS_PATH : "/TransactionHistory/GetTransactions",
  PLATFORM_GET_CHART_DATA_PATH : "/Equity/GetChartDataByContractCode",
  PLATFORM_TRADE_PATH: "/ValueAllocation",
  headers: {
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Connection-Type": "application/x-www-form-urlencoded",
    "Content-Type": "application/x-www-form-urlencoded",
  }
}