const {ImsClient} = require('./ImsClient.js');
const {wretchRetry} = require('./Network');
const QueryStringAddon = require('wretch/addons/queryString');

const { Core } = require('@adobe/aio-sdk');

function asAuthAction(action) {
  return async function (params) {
    const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });
    const imsEndpoint = params['IMS_ENDPOINT']
    const clientId = params['IMS_CLIENT_ID']
    const serviceClientId = params['IMS_SERVICE_CLIENT_ID']
    const clientSecret = params['IMS_SERVICE_CLIENT_SECRET']
    const permAuthCode = params['IMS_SERVICE_PERM_AUTH_CODE']
    const productContext = params['IMS_PRODUCT_CONTEXT']

    // Extract the token from the params
    const accessToken = params.accessToken;

    // Validate the access token
    if (!await isValidToken(imsEndpoint, clientId, accessToken, logger)) {
      throw new Error('Access token is invalid');
    }

    // Check that the profile has expected product context and retrieve the IMS Org
    const imsOrg = await getImsOrgForProductContext(imsEndpoint, clientId, accessToken, productContext, logger);
    if (imsOrg === '') {
      throw new Error('Profile does not have the required product context');
    }

    // If everything is okay, generate a service token
    const imsClient = new ImsClient(imsEndpoint, serviceClientId, clientSecret, permAuthCode);
    const serviceToken = await imsClient.getServiceToken();

    return await action({...params, imsOrg, serviceToken});
  }
}

async function isValidToken(endpoint, clientId, token, logger) {
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
      logger.error(error);
      return false;
    });
}

async function getImsOrgForProductContext(endpoint, clientId, token, productContext, logger) {
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

        // Case 1: No product context found
        if (filteredContextData.length === 0) {
          return '';
        }

        // Case 2: Exactly one product context found
        if (filteredContextData.length === 1) {
          return filteredContextData[0]['prodCtx']['owningEntity'];
        }

        // Case 3: Multiple product contexts found
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
              // Case 3a: Exactly one IMS Org found in the profile
              if (imsOrgsList.length === 1) {
                const { ident: orgIdent, authSrc: orgAuthSrc } = imsOrgsList[0]['orgRef'];
                return `${orgIdent}@${orgAuthSrc}`;
              
              // Case 3b: More than one IMS Org found in the profile
              } else if (imsOrgsList.length > 1) {
                logger.warn(`Multiple IMS Orgs found in the profile with ${productContext}. Returning the first one.`);
                return filteredContextData[0]['prodCtx']['owningEntity'];
              }
            }
          })
          .catch((error) => {
            logger.error(error);
            return '';
          });
        }
      }
      return '';
    })
    .catch((error) => {
      logger.error(error);
      return '';
    });
}

module.exports = {asAuthAction};
