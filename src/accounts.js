var constants = require('./constants');
var axiosConfig = require('./axiosConfig')
var cheerio = require('cheerio')

module.exports = {
  async _getAccountOverviewPage(cookies) {
    const options = {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Connection-Type": "application/x-www-form-urlencoded",
        "Content-Type": "application/x-www-form-urlencoded",
        cookie: cookies
      },
      method: "GET",
      url: `${constants.EASY_EQUITIES_BASE_PLATFORM_URL}${constants.PLATFORM_ACCOUNT_OVERVIEW_PATH}`
    };
    response = await axiosConfig.httpClient(options);

    if (response.status != 200) {
      throw "Account overview page should return 200 status code";
    }

    return response.data
  },

  async list(cookies) {
    const accountsPage = await this._getAccountOverviewPage(cookies)

    const $ = cheerio.load(accountsPage)

    const accountDivs = $("div[id^='trust-account-types']")

    accountDivs.forEach((el) => {
        let tradingCurrency = el.parent.attribs['data-tradingcurrencyid']
      } 
    )


    console.log("Finished")
  }

}