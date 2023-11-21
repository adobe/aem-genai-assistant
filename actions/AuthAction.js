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
}

async function getImsOrgForProductContext(endpoint, clientId, token, productContext, logger) {
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

        // Case 1: No product context found
        if (filteredProductContext.length === 0) {
          return '';
        }

        // Case 2: Exactly one product context found
        if (filteredProductContext.length === 1) {
          return filteredProductContext[0].prodCtx.owningEntity;
        }

        // Case 3: Multiple product contexts found
        if (filteredProductContext.length > 1) {
          return wretchRetry(`${endpoint}/ims/organizations/v6`)
            .headers({
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            })
            .get()
            .json()
            // eslint-disable-next-line consistent-return
            .then((imsOrgsList) => {
              if (Array.isArray(imsOrgsList)) {
              // Case 3a: Exactly one IMS Org found in the profile
                if (imsOrgsList.length === 1) {
                  const { ident: orgIdent, authSrc: orgAuthSrc } = imsOrgsList[0].orgRef;
                  return `${orgIdent}@${orgAuthSrc}`;

                  // Case 3b: More than one IMS Org found in the profile
                } else if (imsOrgsList.length > 1) {
                  logger.warn(`Multiple IMS Orgs found in the profile with ${productContext}. Returning the first one.`);
                  return filteredProductContext[0].prodCtx.owningEntity;
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
    const { accessToken } = params;

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

    return action({ ...params, imsOrg, serviceToken });
  };
}

module.exports = { asAuthAction };
