var constants = require("./constants");
var https = require("https");
var axiosConfig = require('./axiosConfig')

module.exports = {
  async login(username, password) {
    const options = {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Connection-Type": "application/x-www-form-urlencoded",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: `UserIdentifier=${username}&Password=${password}&ReturnUrl=&OneSignalGameId=&IsUsingNewLayoutSatrixOrEasyEquitiesMobileApp=False`,
      method: "POST",
      url: `${constants.EASY_EQUITIES_BASE_PLATFORM_URL}${constants.PLATFORM_SIGN_IN_PATH}`,
      httpsAgent: new https.Agent({ keepAlive: true }),
      maxRedirects: 0,
      validateStatus: null,
    };
    response = await axiosConfig.httpClient(options);

    if (response.status != 302) {
      throw "Login failed";
    }

    return response.headers['set-cookie']
  },
};
