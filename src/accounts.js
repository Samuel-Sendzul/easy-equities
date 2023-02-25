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
    constants.headers.cookie = auth.cookieJar.EECookies;
    const options = {
      headers: constants.headers,
      method: "GET",
      url: `${constants.EASY_EQUITIES_BASE_PLATFORM_URL}${constants.PLATFORM_ACCOUNT_OVERVIEW_PATH}`,
    };
    response = await axiosConfig.httpClient(options);

    if (response.status != 200) {
      throw new Error("Account overview page should return 200 status code");
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
   * @param {string} accountId Account ID as retrieved from the .list() function.
   */
  async _switchAccounts(accountId) {
    if (accountId === undefined) {
      throw new Error("An account ID must be specified.");
    }
    if (accountId !== this.currentAccount) {
      constants.headers.cookie = auth.cookieJar.EECookies;
      const options = {
        headers: constants.headers,
        data: {
          trustAccountId: accountId,
        },
        method: "POST",
        url: `${constants.EASY_EQUITIES_BASE_PLATFORM_URL}${constants.PLATFORM_UPDATE_CURRENCY_PATH}`,
      };
      response = await axiosConfig.httpClient(options);
      if (response.status !== 200) {
        throw new Error(
          "Change account request should return 200 status code."
        );
      }
      this.currentAccount = accountId;
    }
  },
  /**
   * Fetch the funds summary for an account on Easy Equities.
   * @param {string} accountId Account ID as retrieved from the .list() function.
   * @returns Funds summary information for an Easy Equities account. This includes funds available to invest, withdrawable funds, unsettled cash, and locked funds.
   */
  async fundsSummary(accountId) {
    if (accountId === undefined) {
      throw new Error("An account ID must be specified.");
    }

    await this._switchAccounts(accountId);
    constants.headers.cookie = auth.cookieJar.EECookies;
    const options = {
      headers: constants.headers,
      method: "GET",
      url: `${constants.EASY_EQUITIES_BASE_PLATFORM_URL}${constants.PLATFORM_ACCOUNT_VALUATIONS_PATH}`,
    };
    response = await axiosConfig.httpClient(options);
    try {
      const valuations = JSON.parse(response.data);
      let fundsSummary = {};

      for (let summary of valuations["FundSummaryItems"]) {
        switch (summary["Label"]) {
          case "Your Funds to Invest":
            fundsSummary["availableToInvest"] = parseFloat(
              summary["Value"]
                .trim()
                .replace("R", "")
                .replace(",", "")
                .replace(" ", "")
            );
          case "Withdrawable Funds":
            fundsSummary["withdrawableFunds"] = parseFloat(
              summary["Value"]
                .trim()
                .replace("R", "")
                .replace(",", "")
                .replace(" ", "")
            );
          case "Unsettled Cash":
            fundsSummary["unsettledCash"] = parseFloat(
              summary["Value"]
                .trim()
                .replace("R", "")
                .replace(",", "")
                .replace(" ", "")
            );
          case "Locked Funds":
            fundsSummary["lockedFunds"] = parseFloat(
              summary["Value"]
                .trim()
                .replace("R", "")
                .replace(",", "")
                .replace(" ", "")
            );
        }
      }

      return fundsSummary;
    } catch (error) {
      throw new Error(
        "No Easy Equities accounts found. Check authorisation token is fresh or get one using the login mutation."
      );
    }
  },
  /**
   * Fetch a top level summary for an account on Easy Equities.
   * @param {string} accountId Account ID as retrieved from the .list() function.
   * @returns Top level account information for an Easy Equities account. This includes Account Name,
   * Account Number, Account Value, Account Currency.
   */
  async topSummary(accountId) {
    if (accountId === undefined) {
      throw new Error("An account ID must be specified.");
    }

    await this._switchAccounts(accountId);
    constants.headers.cookie = auth.cookieJar.EECookies;
    const options = {
      headers: constants.headers,
      method: "GET",
      url: `${constants.EASY_EQUITIES_BASE_PLATFORM_URL}${constants.PLATFORM_ACCOUNT_VALUATIONS_PATH}`,
    };
    response = await axiosConfig.httpClient(options);
    try {
      const valuations = JSON.parse(response.data);

      const topSummary = {
        accountNumber: valuations["TopSummary"]["AccountNumber"],
        accountName: valuations["TopSummary"]["AccountName"],
        accountValue: valuations["TopSummary"]["AccountValue"],
        accountCurrency: valuations["TopSummary"]["AccountCurrency"],
      };

      return topSummary;
    } catch (error) {
      throw new Error(
        "No Easy Equities accounts found. Check authorisation token is fresh or get one using the login mutation."
      );
    }
  },
  /**
   * Fetch all transactions for a given account ID.
   * @param {string} accountId Account ID as retrieved from the .list() function.
   * @returns List of transactions for the supplied account ID.
   */
  async transactions(accountId) {
    if (accountId === undefined) {
      throw new Error("An account ID must be specified.");
    }
    await this._switchAccounts(accountId);
    constants.headers.cookie = auth.cookieJar.EECookies;
    const options = {
      headers: constants.headers,
      method: "GET",
      url: `${constants.EASY_EQUITIES_BASE_PLATFORM_URL}${constants.PLATFORM_TRANSACTIONS_PATH}`,
    };
    response = await axiosConfig.httpClient(options);

    const rawTransactions = response.data;

    if (!Array.isArray(rawTransactions)) {
      throw new Error("Authentication failed.");
    }

    let transactions = [];
    for (let transaction of rawTransactions) {
      transactions.push({
        action: transaction.Action,
        comment: transaction.Comment,
        contractCode: transaction.ContractCode,
        debitCredit: transaction.DebitCredit,
        transactionDate: transaction.TransactionDate,
        transactionId: transaction.TransactionId,
      });
    }
    return transactions;
  },
  /**
   * Get holdings information for an account (instruments, purchase values, current values, unit prices, and contract codes.)
   * @param {string} accountId Account ID as retrieved from the .list() function.
   * @returns List of holdings information hashmaps.
   */
  async holdings(accountId) {
    if (accountId === undefined) {
      throw new Error("An account ID must be specified.");
    }
    await this._switchAccounts(accountId);
    constants.headers.cookie = auth.cookieJar.EECookies;
    const options = {
      headers: constants.headers,
      method: "GET",
      url: `${constants.EASY_EQUITIES_BASE_PLATFORM_URL}${constants.PLATFORM_HOLDINGS_PATH}`,
    };
    response = await axiosConfig.httpClient(options);

    const $ = cheerio.load(response.data, { ignoreWhitespace: true });
    const instruments = $(
      "div[class='display-none equity-image-as-text']"
    ).find("div");
    const purchaseValues = $("div[class='purchase-value-cell']").find("span");
    const currentValues = $("div[class='current-value-cell']").find("span");
    const currentPrices = $("div[class='current-price-cell']").find("span");
    const contractCodesRaw = $("img[class='instrument']");
    const detailViewURLs = $("div[class='collapse-container']").find("span");

    // Retrieve contact code
    let contractCodes = [];
    for (let code of contractCodesRaw) {
      const contractCodeFirstIndex = code.attribs.src.lastIndexOf("/") + 1;
      const contractCodeLastIndex = code.attribs.src.indexOf(".png");
      const contractCode = code.attribs.src
        .slice(contractCodeFirstIndex, contractCodeLastIndex)
        .trim();
      contractCodes.push(contractCode);
    }

    // Get share count values
    let requests = [];
    for (let detailedViewURL of detailViewURLs) {
      const detailViewURL = `${constants.EASY_EQUITIES_BASE_PLATFORM_URL}${detailedViewURL.attribs["data-detailviewurl"]}`;
      const options = {
        headers: constants.headers,
        method: "GET",
        url: detailViewURL,
      };
      requests.push(axiosConfig.httpClient(options));
    }
    const responses = await Promise.all(requests);

    let shareValues = [];
    for (let response of responses) {
      const $ = cheerio.load(response.data, { ignoreWhitespace: true });

      const numWholeShares = $(
        "div[class='col-xs-4 text-align-right bold-heavy']"
      )[0].children[0].data.trim();
      const numFracShares = $(
        "div[class='col-xs-4 text-align-right bold-heavy']"
      )[1].children[0].data.trim();
      const numShares = parseFloat(numWholeShares + numFracShares);
      shareValues.push(numShares);
    }

    // Compile holdings
    let holdings = [];
    for (let i = 0; i < instruments.length; i++) {
      holdings.push({
        instrument: instruments[i].children[0].data.trim(),
        shares: shareValues[i],
        purchaseValue: parseFloat(
          purchaseValues[i].children[0].data
            .trim()
            .replace("R", "")
            .replace(",", "")
            .replace(" ", "")
        ),
        currentValue: parseFloat(
          currentValues[i].children[0].data
            .trim()
            .replace("R", "")
            .replace(",", "")
            .replace(" ", "")
        ),
        currentPrice: parseFloat(
          currentPrices[i].children[0].data
            .trim()
            .replace("R", "")
            .replace(",", "")
            .replace(" ", "")
        ),
        contractCode: contractCodes[i],
      });
    }

    return holdings;
  },
};
