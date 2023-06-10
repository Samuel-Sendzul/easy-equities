var constants = require("./constants");
var axiosConfig = require("./axiosConfig");
var auth = require("./auth")

module.exports = {
  /**
   * Get historical prices for instruments on EasyEquities.
   * @param {string} contractCode Contract code of the intrument, e.g. EQU.ZA.SYGJP
   * @param {string} period Time period for which to fetch the historical data. Options are 'OneMonth', 'ThreeMonths', 'SixMonths', 'OneYear', 'Max'.
   * @returns A struct containing the daily price series and aggregate return information for the period.
   */
  async historicalPrices(contractCode, period) {
    constants.headers.cookie = auth.cookieJar.EECookies
    const options = {
      headers: constants.headers,
      method: "GET",
      url: `${constants.EASY_EQUITIES_BASE_PLATFORM_URL}${constants.PLATFORM_GET_CHART_DATA_PATH}?code=${contractCode}&period=${period}`,
    };
    response = await axiosConfig.httpClient(options);

    if (response.status != 200) {
      throw new Error("Chart data request should return 200 status code");
    }

    if (response.data.chartData.Dataset.length === 0) {
      throw new Error("Contract code incorrectly specified.");
    }

    let priceSeries = [];
    for (let i = 0; i < response.data.chartData.Dataset.length; i++) {
      priceSeries.push({
        price: response.data.chartData.Dataset[i],
        timestamp: new Date(response.data.chartData.Labels[i]).getTime() / 1000,
      });
    }

    const historicalPrices = {
      priceSeries: priceSeries,
      periodReturn: response.data.chartData.PeriodReturn,
      tradingCurrencySymbol: response.data.chartData.TradingCurrencySymbol,
      contractCode: contractCode
    };

    return historicalPrices;
  },
  /**
   * Retrieves the current price of the requested contract code.
   * @param {string} contractCode Contract code of the intrument, e.g. EQU.ZA.SYGJP
   * @returns An object containing the current price and contract code.
   */
  async currentPrice(contractCode) {
    const historicalPriceOneMonth = await this.historicalPrices(
      contractCode,
      "OneMonth"
    );
    const currentPrice = historicalPriceOneMonth.priceSeries.slice(-1)[0].price
    return {
      currentPrice: currentPrice,
      contractCode: contractCode
    }
  }
};
