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
    .then(async (json) => {
      if (Array.isArray(json['projectedProductContext'])) {
        const filteredContextData = json['projectedProductContext'].filter((obj) => obj['prodCtx']['serviceCode'] === productContext);

        // If there is no product context, return empty string
        if (filteredContextData.length === 0) {
          return '';
        }

        // If there is one product context, return the owning entity
        if (filteredContextData.length === 1) {
          return filteredContextData[0]['prodCtx']['owningEntity'];
        }

        // If there are multiple product contexts, query orgs and return the first IMS org
        if (filteredContextData.length > 1) {
          return await wretchRetry(endpoint + '/ims/organizations/v6')
          .headers({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          })
          .get()
          .json()
          .then((imsOrgsList) => {
            if (Array.isArray(imsOrgsList)) {
              const { ident: orgIdent, authSrc: orgAuthSrc } = imsOrgsList[0]['orgRef'];
              return `${orgIdent}@${orgAuthSrc}`;
            }
          })
          .catch((error) => {
            return '';
          });
        }
      }
      return '';
    })
    .catch((error) => {
      return '';
    });
}

module.exports = {asAuthAction};
