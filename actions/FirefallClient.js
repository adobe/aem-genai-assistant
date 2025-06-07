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
const { Core } = require('@adobe/aio-sdk');
const wretch = require('./Network.js');
const InternalError = require('./InternalError.js');

const logger = Core.Logger('FirefallAction');

// The error identifiers (enclosed in double curly braces) will be replaced with the actual
// error messages after being processed for localization on the frontend
const ERROR_CODES = {
  defaultCompletion: '{{errorOccurredWhileGeneratingResults}}',
  defaultFeedback: '{{errorOccurredWhileSendingFeedback}}',
  400: '{{genAIContentManagementPolicyFilteredResults}}',
  408: '{{requestTimeout}}',
  429: '{{rateLimitExceeded}}',
};

function toFirefallError(error, defaultMessage) {
  const errorMessage = ERROR_CODES[error.status] ?? defaultMessage;
  return new InternalError(error.status ?? 500, `IS-ERROR: ${errorMessage} (${error.status}).`);
}

class FirefallClient {
  constructor(endpoint, apiKey, org, accessToken) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.org = org;
    this.accessToken = accessToken;
  }

  async completion(prompt, temperature = 0.0, asJson = true, model = 'gpt-4-turbo') {
    const startTime = Date.now();

    // must be aligned with the `aem-genai-assistant/generate` AppBuilder action timeout
    // (subtracted 5 seconds to allow some buffer for AppBuilder)
    const REQUEST_TIMEOUT = 295;

    try {
      const response = await wretch(`${this.endpoint}/v1/completions`, { requestTimeout: REQUEST_TIMEOUT })
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
            max_tokens: 800,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            n: 1,
            response_format: (asJson ? {
              type: 'json_object',
            } : {}),
          },
          store_context: true,

        })
        .json();

      const endTime = Date.now();
      const requestTime = ((endTime - startTime) / 1000).toFixed(2);
      logger.info(`Generate request #${response.query_id} completed in ${requestTime} s`);
      response.request_time = requestTime;
      return response;
    } catch (error) {
      logger.error('Failed generating results:', error);
      throw toFirefallError(error, ERROR_CODES.defaultCompletion);
    }
  }

  async feedback(queryId, sentiment) {
    const startTime = Date.now();

    try {
      const response = await wretch(`${this.endpoint}/v1/feedback`)
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

      const endTime = Date.now();
      const requestTime = ((endTime - startTime) / 1000).toFixed(2);
      logger.info(`Feedback request completed in ${requestTime} s`);

      return response;
    } catch (error) {
      logger.error('Failed sending feedback:', error);
      throw toFirefallError(error, ERROR_CODES.defaultFeedback);
    }
  }
}

module.exports = { FirefallClient };
