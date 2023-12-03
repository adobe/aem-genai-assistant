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
const FormUrlAddon = require('wretch/addons/formUrl');
const { wretchRetry } = require('./Network.js');
// const FormDataAddon = require('wretch/addons/formData');

class ImsClient {
  constructor(endpoint, clientId, clientSecret, permAuthCode) {
    this.endpoint = endpoint;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.permAuthCode = permAuthCode;
  }

  async getServiceToken() {
    try {
      const json = await wretchRetry(`${this.endpoint}/ims/token/v1`)
        .addon(FormUrlAddon).formUrl({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: this.permAuthCode,
          grant_type: 'authorization_code',
        })
        .post()
        .json();

      return json.access_token;
    } catch (error) {
      error.json = { ...error.json, origin: 'IMS' };
      throw error;
    }
  }
}

module.exports = { ImsClient };
