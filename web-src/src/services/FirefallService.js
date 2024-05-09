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
import { FIREFALL_ACTION_TYPES, FIREFALL_POLLING_TIMEOUTS } from '../Constants.js';

const poll = async (fn, pollDelay, initialPollDelay, maxPollingTime = FIREFALL_POLLING_TIMEOUTS.MAX_POLLING_TIME) => {
  const STATUS_RUNNING = 'running';
  const wait = async (timeout) => new Promise((resolve) => { setTimeout(resolve, timeout * 1000); });

  if (initialPollDelay) {
    await wait(initialPollDelay);
  }

  let pollingTime = 0;
  while (pollingTime <= maxPollingTime) {
    // eslint-disable-next-line no-await-in-loop
    const response = await fn();

    if (response.status === STATUS_RUNNING) {
      pollingTime += pollDelay;
      // eslint-disable-next-line no-await-in-loop
      await wait(pollDelay);
    } else {
      return response;
    }
  }

  throw new Error(`The call did not complete after ${pollingTime} seconds.`);
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

  async complete(prompt, temperature, actionType) {
    const pollDelay = (actionType === FIREFALL_ACTION_TYPES.VARIATIONS_GENERATION)
      ? FIREFALL_POLLING_TIMEOUTS.VARIATIONS_GENERATION_POLL_DELAY
      : FIREFALL_POLLING_TIMEOUTS.TEXT_TO_IMAGE_PROMPT_GENERATION_POLL_DELAY;
    const initialPollDelay = pollDelay;

    const { jobId } = await wretch(this.completeEndpoint)
      .post({
        prompt,
        temperature,
        imsOrg: this.imsOrg,
        accessToken: this.accessToken,
      })
      .json();

    return poll(async () => {
      return wretch(`${this.completeEndpoint}?jobId=${jobId}`)
        .headers({
          Authorization: `Bearer ${this.accessToken}`,
          'X-Org-Id': this.imsOrg,
        })
        .get()
        .json();
    }, pollDelay, initialPollDelay).then((data) => {
      const { result } = data;
      const { query_id: queryId, generations } = result;
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
      })
      .json();
    /* eslint-disable-next-line camelcase */
    return feedback_id;
  }
}
