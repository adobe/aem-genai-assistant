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
const { wretchRetry } = require('./Network.js');

class FirefallClient {
  constructor(endpoint, apiKey, org, accessToken) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.org = org;
    this.accessToken = accessToken;
  }

  async completion(prompt, temperature = 0.0, model = 'gpt-4') {
    try {
      return wretchRetry(`${this.endpoint}/v1/completions`)
        .headers({
          'x-gw-ims-org-id': this.org,
          'x-api-key': this.apiKey,
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        })
        .post({
          dialogue: {
            question: prompt,
          },
          llm_metadata: {
            llm_type: 'azure_chat_openai',
            model_name: model,
            temperature,
            max_tokens: 4096,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            n: 1,
          },
        })
        .json();
    } catch (error) {
      error.json = { ...error.json, origin: 'FIREFALL' };
      throw error;
    }
  }

  async feedback(queryId, sentiment) {
    try {
      return await wretchRetry(`${this.endpoint}/v1/feedback`)
        .headers({
          Authorization: `Bearer ${this.accessToken}`,
          'x-api-key': this.apiKey,
          'x-gw-ims-org-id': this.org,
          'Content-Type': 'application/json',
        })
        .post({
          query_id: queryId,
          feedback: {
            overall: sentiment ? 'thumbs_up' : 'thumbs_down',
          },
        })
        .json();
    } catch (error) {
      console.error('Error sending feedback:', error);
      error.json = { ...error.json, origin: 'FIREFALL' };
      throw error;
    }
  }
}

module.exports = { FirefallClient };
