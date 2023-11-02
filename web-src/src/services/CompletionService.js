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
import wretch from 'wretch';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
console.log(`API_ENDPOINT: ${API_ENDPOINT}`);

export class CompletionService {
  constructor() {
    console.log('CompletionService constructor');
  }

  /* eslint-disable class-methods-use-this */
  async complete(prompt, temperature) {
    console.log(`CompletionService complete prompt: ${prompt} temperature: ${temperature}`);
    const json = await wretch(`${API_ENDPOINT}?prompt=${encodeURIComponent(prompt)}&t=${temperature}`).get().json();
    // TODO: handle error response
    return json['generations'][0][0]['message']['content'];
  }
}
