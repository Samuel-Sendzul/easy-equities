module.export = {
  async placeOrder(side, baseAmount, contractCode) {
    const options = {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Connection-Type": "application/x-www-form-urlencoded",
        "Content-Type": "application/x-www-form-urlencoded",
        cookie: auth.cookieJar.EECookies,
      },
      method: "POST",
      data: {
        ContractCode: contractCode,
        Risk: baseAmount
      },
      url: `${constants.EASY_EQUITIES_BASE_PLATFORM_URL}${constants.PLATFORM_TRADE_PATH}/${side}`,
    };
    response = await axiosConfig.httpClient(options);
  }
}