var accounts = require("./accounts");
var instruments = require("./instruments");

module.exports = {
  /**
   * Determine what orders need to be placed to achieved a portfolio weighting scheme defined in portfolioWeights.
   * @param {string} accountId EasyEquities account ID.
   * @param {object} portfolioWeights Key-value object containing the desired contract codes as keys and the weighting (in decimal form) of that contract code in the
   *                                  portfolio.
   * @returns A list of rebalancing orders that can be executed on EasyEquities.
   */
  async rebalancingOrders(accountId, portfolioWeights) {
    // Fetch current holdings
    const [holdings, fundsSummary] = await Promise.all([
      accounts.holdings(accountId),
      accounts.fundsSummary(accountId),
    ]);

    // Calculate current portfolio value
    const currentPortfolioValue = this.calculatePortfolioValue(
      fundsSummary.availableToInvest,
      holdings
    );

    // Get current prices of relevant instruments
    currentHoldings = {};
    for (holding of holdings) {
      currentHoldings[holding.contractCode] = holding.shares;
    }

    let priceRequests = [];
    const currentContracts = new Set(Object.keys(currentHoldings))
    const desiredContracts = new Set(Object.keys(portfolioWeights))
    const allContracts = Array.from(currentContracts || desiredContracts)
    for (const contractCode of allContracts) {
      priceRequests.push(instruments.currentPrice(contractCode));
    }
    const currentPricesRaw = await Promise.all(priceRequests);
    // Unpack prices
    let currentPrices = {};
    for (price of currentPricesRaw) {
      currentPrices[price.contractCode] = price.currentPrice;
    }

    // Determine desired portfolio holdings
    const desiredHoldings = {};
    for (const contractCode in portfolioWeights) {
      desiredHoldings[contractCode] =
        Math.round(
          ((portfolioWeights[contractCode] * currentPortfolioValue) /
            currentPrices[contractCode]) *
            10000
        ) / 10000;
    }

    const holdingsDifferences = {};

    // Get intersection of holdings between desired and current and calculate the difference in holding size
    const commonHoldings = Object.keys(currentHoldings).filter((value) =>
      Object.keys(desiredHoldings).includes(value)
    );
    if (commonHoldings.length > 0) {
      for (const holding of commonHoldings) {
        holdingsDifferences[holding] =
          Math.round((desiredHoldings[holding] - currentHoldings[holding]) * 10000) / 10000;
      }
    }

    // Get holdings only in current holdings but not in desired holdings
    const holdingsToSell = Object.keys(currentHoldings).filter(function (x) {
      return commonHoldings.indexOf(x) < 0;
    });
    if (holdingsToSell.length > 0) {
      for (const holding of holdingsToSell) {
        holdingsDifferences[holding] = -currentHoldings[holding];
      }
    }

    // Get holdings only in desired holdings but not in current holdings
    const holdingsToBuy = Object.keys(desiredHoldings).filter(function (x) {
      return commonHoldings.indexOf(x) < 0;
    });
    if (holdingsToBuy.length > 0) {
      for (const holding of holdingsToBuy) {
        holdingsDifferences[holding] = desiredHoldings[holding];
      }
    }

    // Create the rebalancing orders
    const orders = [];
    for (const contract in holdingsDifferences) {
      orders.push({
        contractCode: contract,
        side: holdingsDifferences[contract] > 0 ? "BUY" : "SELL",
        amount:
          Math.round(Math.abs(holdingsDifferences[contract]) * 1000) / 1000,
        estimatedOrderValue:
          Math.round(
            Math.abs(holdingsDifferences[contract]) *
              currentPrices[contract] *
              100
          ) / 100,
      });
    }

    return orders;
  },
  /**
   * Calculate the value of a portfolio given current holdings and the amount available to invest in the Easy
   * Equities account that holdings comes from.
   * @param {number} availableToInvest Total funds available to invest.
   * @param {Array} holdings Holdings information retrieved from accounts.holdings().
   * @returns The current value of the portfolio in the currency that the EasyEquities account is denominated in.
   */
  calculatePortfolioValue(availableToInvest, holdings) {
    let currentValue = availableToInvest;

    // Add holdings valuation
    for (holding of holdings) {
      currentValue += holding.currentValue;
    }
    return Math.round(currentValue * 100) / 100;
  },
  /**
   * Calculate the portfolio weights of the current portfolio in the EasyEquities account represented by accountId.
   * @param {string} accountId EasyEquities account ID.
   * @returns Key-value object with the keys being the contract codes of the instruments in the EasyEquities account
   *          and the values being the current portfolio weights (in decimal form).
   */
  async currentPortfolioWeights(accountId) {
    const [holdings, fundsSummary] = await Promise.all([
      accounts.holdings(accountId),
      accounts.fundsSummary(accountId),
    ]);

    const currentPortfolioValue = this.calculatePortfolioValue(
      fundsSummary.availableToInvest,
      holdings
    );

    let portfolioWeights = [];

    // Add cash component of account
    portfolioWeights.push({
      contractCode: "cash",
      weight:
        Math.round((availableToInvest / currentPortfolioValue) * 10000) / 10000,
    });

    // Add holdings at current valuation
    for (holding of holdings) {
      portfolioWeights.push({
        contractCode: holding.contractCode,
        weight:
          Math.round((holding.currentValue / currentPortfolioValue) * 10000) /
          10000,
      });
    }

    return portfolioWeights;
  },
};
