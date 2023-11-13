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
import { retry } from 'wretch/middlewares/retry';

function wretchRetry(url) {
  return wretch(url)
    .middlewares([retry({
      retryOnNetworkError: true,
      until: (response) => response && (response.ok || (response.status >= 400 && response.status < 500)),
    })]);
}

export class FirefallService {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async complete(prompt, temperature) {
    /* eslint-disable-next-line camelcase */
    const { query_id, generations } = await wretchRetry(`${this.endpoint}/complete`)
      .post({ prompt, temperature })
      .json();
    return {
      /* eslint-disable-next-line camelcase */
      queryId: query_id,
      content: generations[0][0].message.content,
    };
  }

  async feedback(queryId, sentiment) {
    /* eslint-disable-next-line camelcase */
    const { feedback_id } = await wretchRetry(`${this.endpoint}/feedback`)
      .post({ queryId, sentiment })
      .json();
    return {
      /* eslint-disable-next-line camelcase */
      feedbackId: feedback_id,
    };
  }
}
