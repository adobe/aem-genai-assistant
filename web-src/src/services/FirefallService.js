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

/* eslint-disable max-classes-per-file */

import { wretch } from '../helpers/NetworkHelper.js';
import { replaceRuntimeDomainInUrl } from '../helpers/UrlHelper.js';

const POLL_DELAY = 2; // in seconds
const MAX_POLLING_TIME = 120; // in seconds

class ActivationNotReadyError extends Error {}

const poll = async (fn, maxPollingTime = MAX_POLLING_TIME, pollDelay = POLL_DELAY, initialPollDelay = POLL_DELAY) => {
  const wait = async (timeout) => new Promise((resolve) => { setTimeout(resolve, timeout * 1000); });

  if (initialPollDelay) {
    await wait(initialPollDelay);
  }

  let pollingTime = 0;
  while (pollingTime <= maxPollingTime) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fn();
    } catch (error) {
      if (!(error instanceof ActivationNotReadyError)) {
        throw error;
      }

      pollingTime += pollDelay;
      // eslint-disable-next-line no-await-in-loop
      await wait(pollDelay);
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
        .error(503, () => {
          throw new ActivationNotReadyError();
        })
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
