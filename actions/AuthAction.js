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

const { Core } = require('@adobe/aio-sdk');
const LaunchDarkly = require('@launchdarkly/node-server-sdk');
const QueryStringAddon = require('wretch/addons/queryString');
const wretch = require('./Network.js');
const { checkForAdobeInternalUser } = require('./ActionUtils.js');

const logger = Core.Logger('AuthAction');

/**
 * Extracts a user access token from the Authorization header
 *
 * @param {object} params action input parameters
 * @returns {string} the token string
 */
function getAccessToken(params) {
  // we agreed to utilize AppBuilder's built-in authentication,
  // so here we can be sure that the Authorization Bearer Token header is set, and valid
  return params.__ow_headers.authorization.substring('Bearer '.length);
}

/**
 * Extracts an Adobe IMS organization ID from the 'x-gw-ims-org-id' header
 *
 * @param {object} params action input parameters
 * @returns {string|undefined} the Adobe IMS organization ID string, or undefined if not present
 */
function getImsOrg(params) {
  return (params.__ow_headers && params.__ow_headers['x-gw-ims-org-id']) ? params.__ow_headers['x-gw-ims-org-id'] : undefined;
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

async function checkForEarlyProductAccess(toggle, sdkKey, isInternal, org) {
  const ldClient = LaunchDarkly.init(sdkKey);
  const context = {
    kind: 'user',
    key: org,
    imsOrgId: org,
    internal: isInternal,
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

function asAuthAction(action, isAuthorize = true) {
  return async (params) => {
    const imsEndpoint = params.IMS_ENDPOINT;
    const clientId = params.IMS_CLIENT_ID;
    const productContext = params.IMS_PRODUCT_CONTEXT;
    const earlyAccessToggle = params.FT_EARLY_ACCESS;
    const ldSdkKey = params.LD_SDK_KEY;

    const imsOrg = getImsOrg(params);
    const accessToken = getAccessToken(params);

    if (isAuthorize) {
      // Check that the profile has access to the product
      const imsProfile = await getImsProfile(imsEndpoint, clientId, accessToken);
      if (!imsProfile) {
        throw new Error('Failed to fetch profile');
      }

      if (!await checkForProductContext(imsProfile, imsOrg, productContext)) {
        const isInternalUser = checkForAdobeInternalUser(imsProfile);

        if (!await checkForEarlyProductAccess(earlyAccessToggle, ldSdkKey, isInternalUser, imsOrg)) {
          throw new Error('Profile does not have access to the product');
        }
      }
    }

    return action({ ...params, imsOrg, accessToken });
  };
}

module.exports = { asAuthAction };
