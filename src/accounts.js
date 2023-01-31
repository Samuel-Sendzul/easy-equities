var constants = require("./constants");
var axiosConfig = require("./axiosConfig");
var auth = require("./auth");

var cheerio = require("cheerio");

module.exports = {
  // Currently selected account ID.
  currentAccount: undefined,

  /**
   * Fetch the Accounts Overview page (returned as raw HTML).
   * @returns {string} Raw HTML Accounts Overview page.
   */
  async _getAccountOverviewPage() {
    const options = {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Connection-Type": "application/x-www-form-urlencoded",
        "Content-Type": "application/x-www-form-urlencoded",
        cookie: auth.cookieJar.myCookies,
      },
      method: "GET",
      url: `${constants.EASY_EQUITIES_BASE_PLATFORM_URL}${constants.PLATFORM_ACCOUNT_OVERVIEW_PATH}`,
    };
    response = await axiosConfig.httpClient(options);

    if (response.status != 200) {
      throw "Account overview page should return 200 status code";
    }

    return response.data;
  },

  /**
   * List all available accounts for an EasyEquities profile.
   * @returns List of account information.
   */
  async list() {
    const accountsPage = await this._getAccountOverviewPage();

    const $ = cheerio.load(accountsPage, { ignoreWhitespace: true });

    const accountDivs = $("div[id='trust-account-types']");

    let accounts = [];
    for (let i = 0; i < accountDivs.length; i++) {
      const tradingCurrencyId =
        accountDivs[i].parent.attribs["data-tradingcurrencyid"];
      if (tradingCurrencyId !== undefined) {
        accounts.push({
          name: accountDivs[i].children[0].data.trim(),
          tradingCurrencyId: tradingCurrencyId,
          id: accountDivs[i].parent.attribs["data-id"],
        });
      }
    }

    return accounts;
  },

  /**
   * Switch the selected account if the supplied account ID is different from the currently selected account.
   * @param {string} accountId
   */
  async _switchAccounts(accountId) {
    if (accountId !== this.currentAccount) {
      const options = {
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Connection-Type": "application/x-www-form-urlencoded",
          "Content-Type": "application/x-www-form-urlencoded",
          cookie: auth.cookieJar.myCookies,
        },
        data: {
          trustAccountId: accountId,
        },
        method: "POST",
        url: `${constants.EASY_EQUITIES_BASE_PLATFORM_URL}${constants.PLATFORM_UPDATE_CURRENCY_PATH}`,
      };
      response = await axiosConfig.httpClient(options);
      if (response.status !== 200) {
        throw "Update currency request should return 200 status code.";
      }
      this.currentAccount = accountId;
    }
  },

  /**
   * Fetch all aggregate valuation data relating to an account.
   * @param {string} accountId
   * @returns Aggregate valuation information for an account.
   */
  async valuations(accountId) {
    await this._switchAccounts(accountId);
    const options = {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Connection-Type": "application/x-www-form-urlencoded",
        "Content-Type": "application/x-www-form-urlencoded",
        cookie: auth.cookieJar.myCookies,
      },
      method: "GET",
      url: `${constants.EASY_EQUITIES_BASE_PLATFORM_URL}${constants.PLATFORM_ACCOUNT_VALUATIONS_PATH}`,
    };
    response = await axiosConfig.httpClient(options);

    const valuations = JSON.parse(response.data);

    return valuations;
  },
  /**
   * Fetch all transactions for a given account ID.
   * @param {string} accountId 
   * @returns List of transactions for the supplied account ID.
   */
  async transactions(accountId) {
    await this._switchAccounts(accountId);
    const options = {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Connection-Type": "application/x-www-form-urlencoded",
        "Content-Type": "application/x-www-form-urlencoded",
        cookie: auth.cookieJar.myCookies,
      },
      method: "GET",
      url: `${constants.EASY_EQUITIES_BASE_PLATFORM_URL}${constants.PLATFORM_TRANSACTIONS_PATH}`,
    };
    response = await axiosConfig.httpClient(options);

    const transactions = response.data;

    return transactions;
  },
};
