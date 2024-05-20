/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
const { Core, State } = require('@adobe/aio-sdk');
const LaunchDarkly = require('@launchdarkly/node-server-sdk');
const QueryStringAddon = require('wretch/addons/queryString');
const { ImsClient } = require('./ImsClient.js');
const wretch = require('./Network.js');
const { checkForAdobeInternalUser } = require('./ActionUtils.js');

// const logger = Core.Logger('AuthAction');
const logger = Core.Logger('AuthAction', { level: 'debug' });
const mockAccessProfile = require('../data/mock-access-profile.json');

/**
 * Extracts a user access token from either the Authorization header or the request payload
 *
 * @param {object} params action input parameters
 * @returns {string|undefined} the token string, or undefined if not present
 */
function getAccessToken(params) {
  // First, check if a bearer user access token is set
  if (
    params.__ow_headers
    && params.__ow_headers.authorization
    && params.__ow_headers.authorization.startsWith('Bearer ')
  ) {
    return params.__ow_headers.authorization.substring('Bearer '.length);
  }

  // Second, check if a token has been passed through the payload
  return params.accessToken;
}

/**
 * Extracts an Adobe IMS organization ID from either the 'X-Org-Id' header or the request payload
 *
 * @param {object} params action input parameters
 * @returns {string|undefined} the Adobe IMS organization ID string, or undefined if not present
 */
function getImsOrg(params) {
  // First, check if an Adobe IMS organization ID has been passed through the 'X-Org-Id' header
  if (
    params.__ow_headers
    && params.__ow_headers['x-org-id']
  ) {
    return params.__ow_headers['x-org-id'];
  }

  // Second, check if an Adobe IMS organization ID has been passed through the payload
  return params.imsOrg;
}

async function isValidToken(endpoint, clientId, token) {
  try {
    const response = await wretch(`${endpoint}/ims/validate_token/v1`)
      .addon(QueryStringAddon).query({
        client_id: clientId,
        type: 'access_token',
      })
      .headers({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      })
      .get()
      .json();
    return response.valid;
  } catch (error) {
    logger.error(error);
    return false;
  }
}

async function getImsProfile(endpoint, clientId, token) {
  try {
    const response = await wretch(`${endpoint}/ims/profile/v1`)
      .addon(QueryStringAddon).query({
        client_id: clientId,
      })
      .headers({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      })
      .get()
      .json();
    return response;
  } catch (error) {
    logger.error(error);
    return null;
  }
}

async function getAccessProfile(appId, clientId, endpoint, accesstoken, serviceToken) {
  try {
    const response = await wretch(`${endpoint}/services/access_profile/v3`)
      .headers({
        Authorization: `Bearer ${serviceToken}`,
        'x-api-key': clientId,
        'x-user-token': accesstoken,
      })
      .post({
        appDetails: {
          nglAppVersion: '1.0',
          nglLibRuntimeMode: 'NAMED_USER_ONLINE',
          nglLibVersion: '12.3',
          locale: 'en_US',
          appNameForLocale: appId,
          nglAppId: appId,
          appVersionForLocale: '1.0',
        },
        deviceDetails: {},
      })
      .json();

    return atob(response.asnp.payload);
  } catch (error) {
    logger.error(error);
    return null;
  }
}

function getMockAccessProfile() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockAccessProfile);
    }, 2000);
  });
}

async function checkForProductContext(profile, org, productContext) {
  try {
    if (Array.isArray(profile.projectedProductContext)) {
      const filteredProductContext = profile.projectedProductContext
        .filter((obj) => obj.prodCtx.serviceCode === productContext);

      // For each entry in filteredProductContext check that
      // there is at least one entry where imsOrg matches the owningEntity property
      // otherwise, if no match, the user is not authorized
      return filteredProductContext.some((obj) => obj.prodCtx.owningEntity === org);
    }
    return false;
  } catch (error) {
    logger.error(error);
    return false;
  }
}

function checkForProductAccess(accessProfile, imsOrg, entitlement) {
  if (Array.isArray(accessProfile.appProfile?.accessibleItems)) {
    const filteredItems = accessProfile.appProfile.accessibleItems
      .filter((obj) => obj.fulfillable_items[entitlement]?.enabled);

    // For each entry in filteredItems check that
    // there is at least one entry where user.imsOrg matches the owner_id property
    // otherwise, if no match, the user is not authorized to use Express
    return filteredItems.some((obj) => obj.source.owner_id === imsOrg);
  }
  return false;
}

async function checkForEarlyProductAccess(toggle, sdkKey, isInternal, org) {
  const ldClient = LaunchDarkly.init(sdkKey);
  const context = {
    kind: 'user',
    key: org,
    imsOrgId: org,
    internal: false,
  };

  return new Promise((resolve, reject) => {
    ldClient.once('ready', () => {
      ldClient.variation(toggle, context, false, (err, showFeature) => {
        if (err) {
          logger.error(err);
          reject(err);
        } else {
          resolve(showFeature);
        }
      });
    });

    ldClient.on('error', (err) => {
      logger.error(err);
      reject(err);
    });
  });
}

async function getExistingServiceToken(state, profile) {
  const storedUser = await state.get(profile.userId);

  if (storedUser) {
    logger.debug(`Found existing service token for user ${profile.userId}`);
    return storedUser.value.serviceToken;
  }
  return null;
}

function asAuthAction(action) {
  return async (params) => {
    const imsEndpoint = params.IMS_ENDPOINT;
    const clientId = params.IMS_CLIENT_ID;
    const serviceClientId = params.IMS_SERVICE_CLIENT_ID;
    const clientSecret = params.IMS_SERVICE_CLIENT_SECRET;
    const permAuthCode = params.IMS_SERVICE_PERM_AUTH_CODE;
    const productEntitlement = params.PRODUCT_ENTITLEMENT;
    const accessAppId = process.env.ACCESS_PLATFORM_APP_ID;
    const accessClientId = process.env.ACCESS_PLATFORM_CLIENT_ID;
    const accessEndpoint = process.env.ACCESS_PROFILE_ENDPOINT;
    const earlyAccessToggle = params.FT_EARLY_ACCESS;
    const ldSdkKey = params.LD_SDK_KEY;

    const accessToken = getAccessToken(params);
    const imsOrg = getImsOrg(params);

    // Validate the access token
    if (!await isValidToken(imsEndpoint, clientId, accessToken)) {
      throw new Error('Access token is invalid');
    }

    // Check that the IMS profile has access to the product
    const imsProfile = await getImsProfile(imsEndpoint, clientId, accessToken);
    if (!imsProfile) {
      throw new Error('Failed to fetch IMS profile');
    }

    // If everything is okay, retrieve or generate a service token
    const userState = await State.init();
    let serviceToken = await getExistingServiceToken(userState, imsProfile);

    if (!serviceToken) {
      const imsClient = new ImsClient(imsEndpoint, serviceClientId, clientSecret, permAuthCode);
      const { access_token: token, expires_in: expiryTimeMs } = await imsClient.getServiceToken();
      serviceToken = token;

      logger.debug(`Setting new service token for user ${imsProfile.userId}`);
      await userState.put(imsProfile.userId, { serviceToken: token }, { ttl: expiryTimeMs });
    }

    // Check that the Access profile has access to the product
    // const accessProfile = await getAccessProfile(
    // accessAppId, accessClientId, accessEndpoint, accessToken, serviceToken);
    const accessProfile = await getMockAccessProfile();

    if (!checkForProductAccess(accessProfile, imsOrg, productEntitlement)) {
      const isInternalUser = checkForAdobeInternalUser(imsProfile);

      if (!await checkForEarlyProductAccess(earlyAccessToggle, ldSdkKey, isInternalUser, imsOrg)) {
        throw new Error('Profile does not have access to the product');
      }
    }

    return action({ ...params, imsOrg, serviceToken });
  };
}

module.exports = { asAuthAction };
