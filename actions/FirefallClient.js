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

const FIREFALL_ERROR_CODES = {
  defaultCompletion: 'An error occurred while generating results',
  defaultFeedback: 'An error occurred while sending feedback',
  400: "The response was filtered due to the prompt triggering Azure OpenAI's content management policy. Please modify your prompt and retry. To learn more about our content filtering policies please read Azure's documentation: https://go.microsoft.com/fwlink/?linkid=2198766",
  429: 'OpenAI Rate limit exceeded. Please wait one minute and try again',
};

function firefallErrorMessage(defaultMessage, errorStatus) {
  const errorString = FIREFALL_ERROR_CODES[errorStatus] ?? defaultMessage;
  return `IS-ERROR: ${errorString} (${errorStatus}).`;
}

class FirefallClient {
  constructor(endpoint, apiKey, org, accessToken) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.org = org;
    this.accessToken = accessToken;
  }

  async completion(prompt, temperature = 0.0, model = 'gpt-4') {
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
      .json()
      .catch((error) => {
        // console.error('Error generating completion:', error);
        throw new Error(firefallErrorMessage(FIREFALL_ERROR_CODES.defaultCompletion, error.status));
      });
  }

  async feedback(queryId, sentiment) {
    return wretchRetry(`${this.endpoint}/v1/feedback`)
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
      .json()
      .catch((error) => {
        // console.error('Error generating completion:', error);
        throw new Error(firefallErrorMessage(FIREFALL_ERROR_CODES.defaultFeedback, error.status));
      });
  }
}

module.exports = { FirefallClient };
