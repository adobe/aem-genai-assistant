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
import { wretch } from '../helpers/NetworkHelper.js';
import { replaceRuntimeDomainInUrl } from '../helpers/UrlHelper.js';

const poll = async (fn, maxRetries = 30, pollDelay = 10000) => {
  let retries = 0;
  while (retries <= maxRetries) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fn();
    } catch (error) {
      retries += 1;
      console.error(error);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => { setTimeout(resolve, pollDelay); });
    }
  }

  throw new Error(`Failed after ${retries} retries.`);
};

export class FirefallService {
  constructor({
    completeEndpoint,
    feedbackEndpoint,
    imsOrg,
    accessToken,
  }) {
    this.completeEndpoint = replaceRuntimeDomainInUrl(completeEndpoint);
    this.feedbackEndpoint = replaceRuntimeDomainInUrl(feedbackEndpoint);
    this.imsOrg = imsOrg;
    this.accessToken = accessToken;

    console.debug(`Complete: ${this.completeEndpoint}`);
    console.debug(`Feedback: ${this.feedbackEndpoint}`);
  }

  async complete(prompt, temperature) {
    const { activationId } = await wretch(this.completeEndpoint)
      .post({
        prompt,
        temperature,
        imsOrg: this.imsOrg,
        accessToken: this.accessToken,
      })
      .json();

    return poll(async () => {
      return wretch(`${this.completeEndpoint}?activationId=${activationId}`)
        .headers({
          Authorization: `Bearer ${this.accessToken}`,
          'X-Org-Id': this.imsOrg,
        })
        .get()
        .json();
    }).then((data) => {
      const { query_id: queryId, generations } = data;
      return {
        queryId,
        response: generations[0][0].message.content,
      };
    });
  }

  async feedback(queryId, sentiment) {
    /* eslint-disable-next-line camelcase */
    const { feedback_id } = await wretch(this.feedbackEndpoint)
      .post({
        queryId,
        sentiment,
        imsOrg: this.imsOrg,
        accessToken: this.accessToken,
      });
    /* eslint-disable-next-line camelcase */
    return feedback_id;
  }
}
