const { Core } = require('@adobe/aio-sdk');

const {ImsClient} = require('./ImsClient.js');
const {wretchRetry} = require('./Network');

const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });

function asAuthAction(action) {
  return async function (params) {
    const imsEndpoint = params['IMS_ENDPOINT']
    const clientId = params['IMS_SERVICE_CLIENT_ID']
    const clientSecret = params['IMS_SERVICE_CLIENT_SECRET']
    const permAuthCode = params['IMS_SERVICE_PERM_AUTH_CODE']
    const productContext = params['IMS_PRODUCT_CONTEXT']

    // Extract the token from the params
    const accessToken = params.accessToken;
    
    logger.info(`Access Token: ${accessToken}`);

    // Validate the access token
    if (!await isValidToken(clientId, accessToken)) {
      throw new Error('Access token is invalid');
    }

    // Check that the profile has expected product context
    if (!await checkProductContextFromProfile(clientId, accessToken, productContext)) {
      throw new Error('Profile does not have the required product context');
    }

    // Retrieve the IMS org from the profile
    const imsOrg = await getImsOrgFromProfile(clientId, accessToken);
    if (imsOrg === '') {
      throw new Error('Profile does not have an IMS org');
    }

    // If everything is okay, generate a service token
    const imsClient = new ImsClient(imsEndpoint, clientId, clientSecret, permAuthCode);

    const serviceToken = await imsClient.getServiceToken();

    return await action({...params, imsOrg, serviceToken});
  }
}

async function isValidToken(clientId, token) {
  return await wretchRetry(this.endpoint + 'ims/validate_token/v1')
    .headers({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    })
    .get({
      client_id: clientId,
      type: 'access_token'
    })
    .json()
    .then((json) => {
      return json['valid'];
    })
    .catch((error) => {
      logger.info('Error validating access token: ', error);
      return false;
    });
}

async function checkProductContextFromProfile(clientId, token, productContext) {
  return await wretchRetry(this.endpoint + 'ims/profile/v1')
    .headers({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    })
    .get({
      client_id: clientId
    })
    .json()
    .then((json) => {
      if (Array.isArray(json['projectedProductContext'])) {
        for (const obj of json['projectedProductContext']) {
          if (obj['prodCtx']['serviceCode'] === productContext) {
            return true;
          }
        }
      }
      return false;
    })
    .catch((error) => {
      logger.info("Error checking the product context from profile: ", error);
      return false;
    });
}

async function getImsOrgFromProfile(clientId, token) {
  return await wretchRetry(this.endpoint + 'ims/profile/v1')
    .headers({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    })
    .get({
      client_id: clientId
    })
    .json()
    .then((json) => {
      if (Array.isArray(json['roles'])) {
        for (const obj of json['roles']) {
          if (obj['organization'] && obj['organization'] !== '') {
            return obj['organization'];
          }
        }
      }
      return '';
    })
    .catch((error) => {
      logger.info('Error retrieving IMS org from profile: ', error);
      return '';
    });
}

module.exports = {asAuthAction};
