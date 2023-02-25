var accounts = require("./accounts");

module.exports = {
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
    // Determine desired portfolio holdings

    // Calculate holdings differences
  },

  calculatePortfolioValue(availableToInvest, holdings) {
    let currentValue = availableToInvest;

    // Add holdings valuation
    for (holding of holdings) {
      currentValue += holding.currentValue;
    }
    return Math.round(currentValue * 100) / 100;
  },

  currentPortfolioWeights(availableToInvest, holdings) {
    const currentPortfolioValue = this.calculatePortfolioValue(
      availableToInvest,
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
