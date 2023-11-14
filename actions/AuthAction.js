const {ImsClient} = require('./ImsClient.js');
const {wretchRetry} = require('./Network');
const QueryStringAddon = require('wretch/addons/queryString');

function asAuthAction(action) {
  return async function (params) {
    const imsEndpoint = params['IMS_ENDPOINT']
    const clientId = params['IMS_CLIENT_ID']
    const serviceClientId = params['IMS_SERVICE_CLIENT_ID']
    const clientSecret = params['IMS_SERVICE_CLIENT_SECRET']
    const permAuthCode = params['IMS_SERVICE_PERM_AUTH_CODE']
    const productContext = params['IMS_PRODUCT_CONTEXT']

    // Extract the token from the params
    const accessToken = params.accessToken;

    // Validate the access token
    if (!await isValidToken(imsEndpoint, clientId, accessToken)) {
      throw new Error('Access token is invalid');
    }

    // Check that the profile has expected product context and retrieve the IMS org
    const imsOrg = await getImsOrgForProductContext(imsEndpoint, clientId, accessToken, productContext);
    if (imsOrg === '') {
      throw new Error('Profile does not have the required product context');
    }

    // If everything is okay, generate a service token
    const imsClient = new ImsClient(imsEndpoint, serviceClientId, clientSecret, permAuthCode);
    const serviceToken = await imsClient.getServiceToken();

    return await action({...params, imsOrg, serviceToken});
  }
}

async function isValidToken(endpoint, clientId, token) {
  return await wretchRetry(endpoint + '/ims/validate_token/v1')
    .addon(QueryStringAddon).query({
      client_id: clientId,
      type: 'access_token'
    })
    .headers({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    })
    .get()
    .json()
    .then((json) => {
      return json['valid'];
    })
    .catch((error) => {
      return false;
    });
}

async function getImsOrgForProductContext(endpoint, clientId, token, productContext) {
  return await wretchRetry(endpoint + '/ims/profile/v1')
    .addon(QueryStringAddon).query({
      client_id: clientId
    })
    .headers({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    })
    .get()
    .json()
    .then((json) => {
      if (Array.isArray(json['projectedProductContext'])) {
        for (const obj of json['projectedProductContext']) {
          if (obj['prodCtx']['serviceCode'] === productContext) {
            return obj['prodCtx']['owningEntity'];
          }
        }
      }
      return '';
    })
    .catch((error) => {
      return '';
    });
}

module.exports = {asAuthAction};
