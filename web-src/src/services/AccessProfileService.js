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

import { wretch } from '../helpers/NetworkHelper.js';

export class AccessProfileService {
  constructor({
    appId, clientId, endpoint, accessToken,
  }) {
    this.appId = appId;
    this.clientId = clientId;
    this.endpoint = endpoint;
    this.accessToken = accessToken;
  }

  async getAccessProfile() {
    const response = await wretch(`${this.endpoint}/webapps/access_profile/v3`)
      .headers({
        Authorization: `Bearer ${this.accessToken}`,
        'x-api-key': this.clientId,
      })
      .post({
        appDetails:
        {
          nglAppVersion: '1.0',
          nglLibRuntimeMode: 'NAMED_USER_ONLINE',
          nglLibVersion: '12.3',
          locale: 'en_US',
          appNameForLocale: this.appId,
          nglAppId: this.appId,
          appVersionForLocale: '1.0',
        },
        deviceDetails: {},
      })
      .json();

    return JSON.parse(atob(response.asnp.payload));
  }

  static create(imsToken) {
    if (!imsToken) {
      return null;
    }
    return new AccessProfileService({
      appId: process.env.ACCESS_PLATFORM_APP_ID,
      clientId: process.env.IMS_CLIENT_ID,
      endpoint: process.env.ACCESS_PROFILE_ENDPOINT,
      accessToken: imsToken,
    });
  }
}
