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

import { wretch } from '../helpers/NetworkHelper.js';
import { replaceRuntimeDomainInUrl } from '../helpers/UrlHelper.js';

export class AemService {
  constructor({
    aemHost,
    cfEndpoint,
    imsOrg,
    accessToken,
  }) {
    this.aemHost = aemHost;
    this.cfEndpoint = replaceRuntimeDomainInUrl(cfEndpoint);
    this.imsOrg = imsOrg;
    this.accessToken = accessToken;

    console.debug(`AEM Host: ${this.aemHost}`);
    console.debug(`CF Endpoint: ${this.cfEndpoint}`);
  }

  getHost() {
    return this.aemHost;
  }

  async getFragment(fragmentId) {
    console.debug(`Getting fragment ${fragmentId}`);
    return wretch(this.cfEndpoint)
      .auth(`Bearer ${this.accessToken}`)
      .headers({
        'x-gw-ims-org-id': this.imsOrg,
      })
      .post({
        command: 'getFragment',
        aemHost: this.aemHost,
        fragmentId,
      })
      .json();
  }

  async getFragmentModel(modelId) {
    console.debug(`Getting model ${modelId}`);
    return wretch(this.cfEndpoint)
      .auth(`Bearer ${this.accessToken}`)
      .headers({
        'x-gw-ims-org-id': this.imsOrg,
      })
      .post({
        command: 'getFragmentModel',
        aemHost: this.aemHost,
        modelId,
      })
      .json();
  }

  async createFragmentVariation(fragmentId, variationName, content) {
    console.debug(`Creating variation ${variationName} for fragment ${fragmentId}`);
    return wretch(this.cfEndpoint)
      .auth(`Bearer ${this.accessToken}`)
      .headers({
        'x-gw-ims-org-id': this.imsOrg,
      })
      .post({
        command: 'createFragmentVariation',
        aemHost: this.aemHost,
        fragmentId,
        variationName,
        content,
      })
      .json();
  }
}
