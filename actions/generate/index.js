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

const { asFirefallAction } = require('../FirefallAction.js');

function main(params) {
  const {
    prompt, temperature, model, firefallClient,
  } = params;
  return firefallClient.completion(prompt ?? 'Who are you?', temperature ?? 0.0, model ?? 'gpt-4-turbo');
}

exports.main = asFirefallAction(main);
