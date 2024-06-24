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
const QueryStringAddon = require('wretch/addons/queryString');
const wretch = require('./Network.js');

const logger = Core.Logger('AuthNAction');

/**
 * Extracts an Adobe IMS organization ID from the 'x-gw-ims-org-id' header
 *
 * @param {object} params action input parameters
 * @returns {string|undefined} the Adobe IMS organization ID string, or undefined if not present
 */
function getImsOrg(params) {
  return (params.__ow_headers && params.__ow_headers['x-gw-ims-org-id']) ? params.__ow_headers['x-gw-ims-org-id'] : undefined;
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

/**
 * Extracts a user access token from the Authorization header
 *
 * @param {object} params action input parameters
 * @returns {Promise<string>} the token string
 */
async function getAccessToken(params) {
  const imsEndpoint = params.IMS_ENDPOINT;
  const clientId = params.IMS_CLIENT_ID;

  // First, check if a bearer user access token is set
  if (
    params.__ow_headers
    && params.__ow_headers.authorization
    && params.__ow_headers.authorization.startsWith('Bearer ')
  ) {
    const accessToken = params.__ow_headers.authorization.substring('Bearer '.length);
    // Validate the access token

    // The error identifiers (enclosed in double curly braces) will be replaced with the actual
    // error messages after being processed for localization on the frontend
    if (!await isValidToken(imsEndpoint, clientId, accessToken)) {
      throw new Error('{{invalidAccessToken}}');
    }
    return accessToken;
  } else {
    throw new Error('{{missingAccessToken}}');
  }
}

function asAuthNAction(action) {
  return async (params) => {
    const imsOrg = getImsOrg(params);
    const accessToken = await getAccessToken(params);

    return action({ ...params, imsOrg, accessToken });
  };
}

module.exports = { asAuthNAction };
