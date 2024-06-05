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

export const FIREFALL_ACTION_TYPES = {
  TEXT_TO_IMAGE_PROMPT_GENERATION: 'text-to-image',
  VARIATIONS_GENERATION: 'variations',
};

// all the following constants are in seconds
const MAX_POLLING_TIME = 300;
const TEXT_TO_IMAGE_PROMPT_GENERATION_POLL_DELAY = 1;
const VARIATIONS_GENERATION_POLL_DELAY = 5;

const poll = async (fn, pollDelay, initialPollDelay, maxPollingTime = MAX_POLLING_TIME) => {
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
      ? VARIATIONS_GENERATION_POLL_DELAY
      : TEXT_TO_IMAGE_PROMPT_GENERATION_POLL_DELAY;
    const initialPollDelay = pollDelay;

    const { jobId } = await wretch(this.completeEndpoint)
      .auth(`Bearer ${this.accessToken}`)
      .headers({
        'x-gw-ims-org-id': this.imsOrg,
      })
      .post({
        prompt,
        temperature,
      })
      .json();

    return poll(async () => {
      return wretch(`${this.completeEndpoint}?jobId=${jobId}`)
        .auth(`Bearer ${this.accessToken}`)
        .headers({
          'x-gw-ims-org-id': this.imsOrg,
        })
        .get()
        .json();
    }, pollDelay, initialPollDelay).then((data) => {
      const { result } = data;
      if (result.error) {
        throw new Error(result.error);
      }
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
      .auth(`Bearer ${this.accessToken}`)
      .headers({
        'x-gw-ims-org-id': this.imsOrg,
      })
      .post({
        queryId,
        sentiment,
      })
      .json();
    /* eslint-disable-next-line camelcase */
    return feedback_id;
  }
}
