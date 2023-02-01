var constants = require("./constants");
var axiosConfig = require("./axiosConfig");
var auth = require("./auth");

module.exports = {
  /**
   * Get historical prices for instruments on EasyEquities.
   * @param {string} contractCode Contract code of the intrument, e.g. EQU.ZA.SYGJP
   * @param {string} period Time period for which to fetch the historical data. Options are 'OneMonth', 'ThreeMonths', 'SixMonths', 'OneYear', 'Max'.
   * @returns A struct containing the daily price series and aggregate return information for the period.
   */
  async historicalPrices(contractCode, period) {
    const options = {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Connection-Type": "application/x-www-form-urlencoded",
        "Content-Type": "application/x-www-form-urlencoded",
        cookie: auth.cookieJar.EECookies,
      },
      method: "GET",
      url: `${constants.EASY_EQUITIES_BASE_PLATFORM_URL}${constants.PLATFORM_GET_CHART_DATA_PATH}?code=${contractCode}&period=${period}`,
    };
    response = await axiosConfig.httpClient(options);

    if (response.status != 200) {
      throw new Error("Chart data request should return 200 status code");
    }

    return response.data.chartData;
  },
};
