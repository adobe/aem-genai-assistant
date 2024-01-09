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
const { getLogger } = require('./utils.js');

function asFirefallAction(action) {
  return (params) => {
    const logger = getLogger('FirefallAction', params.LOG_LEVEL);
    const { imsOrg, serviceToken } = params;

    const firefallEndpoint = params.FIREFALL_ENDPOINT;
    const apiKey = params.FIREFALL_API_KEY;

    const firefallClient = new FirefallClient(firefallEndpoint, apiKey, imsOrg, serviceToken, logger);

    return action({ ...params, firefallClient });
  };
}

module.exports = { asFirefallAction };
