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
const QueryStringAddon = require('wretch/addons/queryString');
const { Core } = require('@adobe/aio-sdk');
const { ImsClient } = require('./ImsClient.js');
const { wretchRetry } = require('./Network.js');

async function isValidToken(endpoint, clientId, token, logger) {
  try {
    return wretchRetry(`${endpoint}/ims/validate_token/v1`)
      .addon(QueryStringAddon).query({
        client_id: clientId,
        type: 'access_token',
      })
      .headers({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      })
      .get()
      .json()
      .then((json) => {
        return json.valid;
      })
      .catch((error) => {
        logger.error(error);
        return false;
      });
  } catch (error) {
    error.json = { ...error.json, origin: 'AIO' };
    throw error;
  }
}

async function checkForProductContext(endpoint, clientId, org, token, productContext, logger) {
  try {
    return wretchRetry(`${endpoint}/ims/profile/v1`)
      .addon(QueryStringAddon).query({
        client_id: clientId,
      })
      .headers({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      })
      .get()
      .json()
      .then(async (json) => {
        if (Array.isArray(json.projectedProductContext)) {
          const filteredProductContext = json.projectedProductContext
            .filter((obj) => obj.prodCtx.serviceCode === productContext);

          // For each entry in filteredProductContext check that
          // there is at least one entry where imsOrg matches the owningEntity property
          // otherwise, if no match, the user is not authorized
          return filteredProductContext.some((obj) => obj.prodCtx.owningEntity === org);
        }
        return false;
      })
      .catch((error) => {
        logger.error(error);
        return false;
      });
  } catch (error) {
    error.json = { ...error.json, origin: 'IMS' };
    throw error;
  }
}

function asAuthAction(action) {
  return async (params) => {
    const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });
    const imsEndpoint = params.IMS_ENDPOINT;
    const clientId = params.IMS_CLIENT_ID;
    const serviceClientId = params.IMS_SERVICE_CLIENT_ID;
    const clientSecret = params.IMS_SERVICE_CLIENT_SECRET;
    const permAuthCode = params.IMS_SERVICE_PERM_AUTH_CODE;
    const productContext = params.IMS_PRODUCT_CONTEXT;

    // Extract the token from the params
    const { imsOrg, accessToken } = params;

    // Validate the access token
    if (!await isValidToken(imsEndpoint, clientId, accessToken, logger)) {
      throw new Error('Access token is invalid');
    }

    // Check that the profile has the expected product context
    if (!await checkForProductContext(imsEndpoint, clientId, imsOrg, accessToken, productContext, logger)) {
      throw new Error('Profile does not have the required product context');
    }

    // If everything is okay, generate a service token
    const imsClient = new ImsClient(imsEndpoint, serviceClientId, clientSecret, permAuthCode);
    const serviceToken = await imsClient.getServiceToken();

    return action({ ...params, imsOrg, serviceToken });
  };
}

module.exports = { asAuthAction };
