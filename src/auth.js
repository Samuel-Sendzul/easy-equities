var constants = require("./constants");
var https = require("https");
var axiosConfig = require("./axiosConfig");

module.exports = {
  // Cookie storage
  cookieJar: {
    EECookies: undefined,
  },
  /**
   * Login to EasyEquities. When the correct username and password is supplied. EasyEquities returns a token in the response header. This can be used for further
   * requests in the session.
   * @param {string} username Username used to login to an EasyEquities account.
   * @param {string} password Password used to login to an EasyEquities account.
   * @returns {string} The token required by EasyEquities to authenticate a session.
   */
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
      throw new Error("Login failed");
    } else {
      console.log(`${username} logged in successfully`);
    }

    this.cookieJar.EECookies = response.headers["set-cookie"];

    return response.headers["set-cookie"][1].split(";")[0].split("=")[1];
  },
};
