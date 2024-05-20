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

const STATUS_WAITING = 'WAITING'; // The job is enqueued and is currently waiting to be picked up by the worker.
const STATUS_PROCESSING = 'PROCESSING'; // The worker is executing the job.
const STATUS_SUCCEEDED = 'SUCCEEDED'; // [Terminal state] Job has been successfully accomplished. You can get the response from `output` field.
const STATUS_FAILED = 'FAILED'; // [Terminal state] Job has failed. You can get more details on it from `error_details` field.

const poll = async (fn, pollDelay, initialPollDelay, maxPollingTime = MAX_POLLING_TIME) => {
  const wait = async (timeout) => new Promise((resolve) => { setTimeout(resolve, timeout * 1000); });

  if (initialPollDelay) {
    await wait(initialPollDelay);
  }

  let pollingTime = 0;
  while (pollingTime <= maxPollingTime) {
    // eslint-disable-next-line no-await-in-loop
    const response = await fn();

    if ([STATUS_WAITING, STATUS_PROCESSING].includes(response.status)) {
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

    const { job_id: jobId } = await wretch(this.completeEndpoint)
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
      if (data.status === STATUS_SUCCEEDED) {
        const transform = (str) => {
          if (str.startsWith('```json')) {
            return str.replace(/^```json/, '').replace(/```$/, '');
          }
          return str;
        };
        const { query_id: queryId, output } = data;
        return {
          queryId,
          response: transform(output.capability_response.generations[0][0].message.content),
        };
      } else if (data.status === STATUS_FAILED) {
        throw new Error(data.error_details);
      } else {
        throw new Error(`Unknown status response received: ${data.status}.`);
      }
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
