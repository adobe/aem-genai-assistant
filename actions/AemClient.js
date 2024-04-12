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
const wretch = require('./Network.js');

class AemClient {
  constructor(endpoint, accessToken) {
    this.endpoint = endpoint;
    this.accessToken = accessToken;
  }

  async getFragment(fragmentId) {
    try {
      const url = `${this.endpoint}/adobe/sites/cf/fragments/${fragmentId}`;
      console.debug('Fetching fragment from', url);
      console.debug('Access token', this.accessToken);
      return wretch(url)
        .headers({
          'X-Adobe-Accept-Unsupported-API': '1',
          Authorization: `Bearer ${this.accessToken}`,
        })
        .get()
        .json();
    } catch (error) {
      throw new Error(`Unable to get fragment: ${error.message}`);
    }
  }

  async getFragmentModel(modelId) {
    try {
      const url = `${this.endpoint}/adobe/sites/cf/models/${modelId}`;
      console.debug('Fetching model from', url);
      return wretch(url)
        .headers({
          'X-Adobe-Accept-Unsupported-API': '1',
          Authorization: `Bearer ${this.accessToken}`,
        })
        .get()
        .json();
    } catch (error) {
      throw new Error(`Unable to get model: ${error.message}`);
    }
  }

  async createFragmentVariation(fragmentId, variationName, content) {
    try {
      const createVariationUrl = `${this.endpoint}/adobe/sites/cf/fragments/${fragmentId}/variations`;
      console.debug('Creating variation at', createVariationUrl);

      const createVariationResponse = await wretch(createVariationUrl)
        .headers({
          'X-Adobe-Accept-Unsupported-API': '1',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        })
        .post({ title: variationName })
        .res();

      const eTag = createVariationResponse.headers.get('ETag');
      const variation = await createVariationResponse.json();

      const updateVariationUrl = `${this.endpoint}/adobe/sites/cf/fragments/${fragmentId}/variations/${variation.name}`;
      console.debug('Updating variation at', updateVariationUrl);

      const updates = variation.fields.map((field, index) => ({
        op: 'replace',
        path: `/fields/${index}/values`,
        value: [content[field.name]],
      }));

      await wretch(updateVariationUrl)
        .headers({
          'X-Adobe-Accept-Unsupported-API': '1',
          'If-Match': eTag,
          'Content-Type': 'application/json-patch+json',
          Authorization: `Bearer ${this.accessToken}`,
        })
        .patch(updates)
        .res();

      return updates;
    } catch (error) {
      throw new Error(`Unable to create variation: ${error.message}`);
    }
  }
}

module.exports = { AemClient };
