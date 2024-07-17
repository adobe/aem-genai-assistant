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
const { FirefallClient } = require('./FirefallClient.js');
const { ImsClient } = require('./ImsClient.js');

const getServiceToken = async (params) => {
  const imsEndpoint = params.IMS_ENDPOINT;
  const serviceClientId = params.IMS_SERVICE_CLIENT_ID;
  const clientSecret = params.IMS_SERVICE_CLIENT_SECRET;
  const permAuthCode = params.IMS_SERVICE_PERM_AUTH_CODE;

  const imsClient = new ImsClient(imsEndpoint, serviceClientId, clientSecret, permAuthCode);
  return imsClient.getServiceToken();
};

function asFirefallAction(action) {
  return async (params) => {
    const { imsOrg } = params;
    const serviceToken = await getServiceToken(params);

    const firefallEndpoint = params.FIREFALL_ENDPOINT;
    const apiKey = params.FIREFALL_API_KEY;

    const firefallClient = new FirefallClient(firefallEndpoint, apiKey, imsOrg, serviceToken);

    return action({ ...params, firefallClient });
  };
}

module.exports = { asFirefallAction };
