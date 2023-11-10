const {FirefallClient} = require('./FirefallClient.js');

function asFirefallAction(action) {
  return async function (params) {
    const { accessToken } = params;

    const firefallEndpoint = params['FIREFALL_ENDPOINT']
    const apiKey = params['FIREFALL_API_KEY']
    const org = params['FIREFALL_IMS_ORG']

    const firefallClient = new FirefallClient(firefallEndpoint, apiKey, org, accessToken);

    return await action({...params, firefallClient});
  }
}

module.exports = {asFirefallAction};
