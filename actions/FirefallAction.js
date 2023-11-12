const {FirefallClient} = require('./FirefallClient.js');

function asFirefallAction(action) {
  return async function (params) {
    const { imsOrg, serviceToken } = params;

    const firefallEndpoint = params['FIREFALL_ENDPOINT']
    const apiKey = params['FIREFALL_API_KEY']

    const firefallClient = new FirefallClient(firefallEndpoint, apiKey, imsOrg, serviceToken);

    return await action({...params, firefallClient});
  }
}

module.exports = {asFirefallAction};
