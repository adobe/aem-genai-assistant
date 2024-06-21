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

const { asGenericAction } = require('../GenericAction.js');
const { getCompletions } = require('../AzureOpenAiClient.js');

function main(params) {
  const {
    prompt, temperature, AZURE_OPENAI_API_KEY, AZURE_OPENAI_API_URL,
  } = params;
  return getCompletions(prompt ?? 'Who are you?', temperature ?? 0.0, AZURE_OPENAI_API_KEY, AZURE_OPENAI_API_URL);
}

exports.main = asGenericAction(main);
