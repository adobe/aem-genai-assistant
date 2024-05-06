/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

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

module.exports = {
  getAccessToken,
  getImsOrg,
};
