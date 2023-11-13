const {ImsClient} = require('./ImsClient.js');

function asAuthAction(action) {
  return async function (params) {
    const imsEndpoint = params['IMS_ENDPOINT']
    const clientId = params['IMS_CLIENT_ID']
    const clientSecret = params['IMS_CLIENT_SECRET']

    const imsClient = new ImsClient(imsEndpoint, clientId, clientSecret);

    const accessToken = await imsClient.getAccessToken();

    return await action({...params, accessToken});
  }
}

module.exports = {asAuthAction};
