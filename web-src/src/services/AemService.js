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

export class AemService {
  constructor({
    aemHost,
    cfEndpoint,
    accessToken,
  }) {
    this.aemHost = aemHost;
    this.cfEndpoint = cfEndpoint;
    this.accessToken = accessToken;

    console.debug(`AEM Host: ${this.aemHost}`);
    console.debug(`CF Endpoint: ${this.cfEndpoint}`);
  }

  getHost() {
    return this.aemHost;
  }

  async getFragment(fragmentId) {
    console.debug(`Getting fragment ${fragmentId}`);
    const fragment = await wretch(this.cfEndpoint)
      .post({
        command: 'getFragment',
        aemHost: this.aemHost,
        fragmentId,
        accessToken: this.accessToken,
      })
      .json();
    console.debug(JSON.stringify(fragment));
    return fragment;
  }

  async getFragmentModel(modelId) {
    console.debug(`Getting model ${modelId}`);
    const model = await wretch(this.cfEndpoint)
      .post({
        command: 'getFragmentModel',
        aemHost: this.aemHost,
        modelId,
        accessToken: this.accessToken,
      })
      .json();
    console.debug(JSON.stringify(model));
    return model;
  }

  async createFragmentVariation(fragmentId, variationName, content) {
    console.debug(`Creating variation ${variationName} for fragment ${fragmentId}`);
    console.debug(`Content: ${JSON.stringify(content)}`);
    const variation = await wretch(this.cfEndpoint)
      .post({
        command: 'createFragmentVariation',
        aemHost: this.aemHost,
        fragmentId,
        variationName,
        content,
        accessToken: this.accessToken,
      })
      .json();
    console.debug(JSON.stringify(variation));
    return variation;
  }
}
