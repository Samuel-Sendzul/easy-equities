var constants = require('./constants');
var axios = require('axios');

module.exports = {
    async login(username, password) {
      const options = {
        headers: {
          "Accept": "text/html,application/xhtml+xml, application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Connection": "keep-alive",
          "Connection-Type": "application/x-www-form-urlencoded",
          "Content-Type" : "application/x-www-form-urlencoded"
        },
        data: `f"UserIdentifier=${username}&Password=${password}"
        "&ReturnUrl=&OneSignalGameId=&IsUsingNewLayoutSatrixOrEasyEquitiesMobileApp=False"`,
        method: "POST",
        url: `${constants.EASY_EQUITIES_BASE_PLATFORM_URL}${constants.PLATFORM_SIGN_IN_PATH}`
      };

      resp = await axios(options);

      console.log(resp)
  }
}