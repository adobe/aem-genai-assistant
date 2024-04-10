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

import { v4 as uuid } from 'uuid';
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

  async getFragment(fragmentId) {
    console.debug('Getting fragment');
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

  async getModel(modelId) {
    console.debug('Getting model');
    const model = await wretch(this.cfEndpoint)
      .post({
        command: 'getModel',
        aemHost: this.aemHost,
        modelId,
        accessToken: this.accessToken,
      })
      .json();
    console.debug(JSON.stringify(model));
    return model;
  }

  async getAllModels() {
    console.debug('Getting models');
    const { items } = await wretch(this.cfEndpoint)
      .post({
        command: 'getAllModels',
        aemHost: this.aemHost,
        accessToken: this.accessToken,
      })
      .json();

    for (const item of items) {
      console.debug(JSON.stringify(item, null, 2));
    }

    return items.map((item) => ({
      name: item.name,
      path: item.path,
      fields: item.fields.map((field) => ({
        name: field.name,
        type: field.type,
        label: field.label,
      })),
    }));
  }

  async createVariation(fragmentId, content) {
    const variationName = content.variationName ?? `var-${uuid()}`;
    console.debug(`Creating variation ${variationName} for fragment ${fragmentId}`);
    console.debug(`Content: ${JSON.stringify(content)}`);
    const variation = await wretch(this.cfEndpoint)
      .post({
        command: 'createVariation',
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
