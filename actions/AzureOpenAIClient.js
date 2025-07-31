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

const logger = Core.Logger('AzureOpenAIAction');

// The error identifiers (enclosed in double curly braces) will be replaced with the actual
// error messages after being processed for localization on the frontend
const ERROR_CODES = {
  defaultCompletion: '{{errorOccurredWhileGeneratingResults}}',
  defaultFeedback: '{{errorOccurredWhileSendingFeedback}}',
  400: '{{genAIContentManagementPolicyFilteredResults}}',
  408: '{{requestTimeout}}',
  429: '{{rateLimitExceeded}}',
};

function toAzureOpenAIError(error, defaultMessage) {
  const errorMessage = ERROR_CODES[error.status] ?? defaultMessage;
  return new InternalError(error.status ?? 500, `IS-ERROR: ${errorMessage} (${error.status}).`);
}

class AzureOpenAIClient {
  constructor(endpoint, apiKey, apiVersion = '2024-10-21') {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.apiVersion = apiVersion;
  }

  async completion(prompt, temperature = 0.0, model = 'gpt-4') {
    const startTime = Date.now();

    // must be aligned with the `aem-genai-assistant/generate` AppBuilder action timeout
    // (subtracted 5 seconds to allow some buffer for AppBuilder)
    const REQUEST_TIMEOUT = 295;

    try {
      const response = await wretch(`${this.endpoint}/openai/deployments/${model}/chat/completions?api-version=${this.apiVersion}`, { requestTimeout: REQUEST_TIMEOUT })
        .headers({
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
        })
        .post({
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature,
          max_tokens: 800,
          frequency_penalty: 0,
          presence_penalty: 0,
          response_format: {
            type: 'json_object',
          },
        }).json();

      const endTime = Date.now();
      const requestTime = ((endTime - startTime) / 1000).toFixed(2);
      logger.info(`Generate request completed in ${requestTime} s`);
      console.log(response);

      const generations = [[{
        message: {
          content: response.choices[0].message.content,
        },
      }]];

      return {
        query_id: response.id,
        generations,
      };
    } catch (error) {
      logger.error('Failed generating results:', error);
      throw toAzureOpenAIError(error, ERROR_CODES.defaultCompletion);
    }
  }

  async feedback(queryId, sentiment) {
    const startTime = Date.now();

    try {
      logger.info(`Feedback received for query ${queryId}: ${sentiment ? 'thumbs_up' : 'thumbs_down'} (endpoint: ${this.endpoint})`);

      const endTime = Date.now();
      const requestTime = ((endTime - startTime) / 1000).toFixed(2);
      logger.info(`Feedback request completed in ${requestTime} s`);

      // returning a mock response for compatibility with past Firefall structure
      return {
        feedback_id: `feedback_${queryId}_${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed sending feedback:', error);
      throw toAzureOpenAIError(error, ERROR_CODES.defaultFeedback);
    }
  }
}

module.exports = { AzureOpenAIClient };
