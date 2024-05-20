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

const openwhisk = require('openwhisk');
const { asGenericAction } = require('../GenericAction.js');
const { asAuthAction } = require('../AuthAction.js');

const STATUS_RUNNING = 'running';
const STATUS_COMPLETED = 'completed';

async function main(params) {
  const { jobId } = params;

  const ow = openwhisk();

  if (!jobId) {
    const activation = await ow.actions.invoke({
      name: 'aem-genai-assistant/generate',
      blocking: false,
      result: false,
      params,
    });

    return {
      statusCode: 202,
      jobId: activation.activationId,
    };
  } else {
    try {
      const activation = await ow.activations.get(jobId);

      return {
        jobId,
        status: STATUS_COMPLETED,
        result: activation.response.result,
      };
    } catch (error) {
      if (error instanceof Error && error.constructor.name === 'OpenWhiskError' && error.statusCode === 404) {
        // For valid activation IDs that haven't finished yet, App Builder (OpenWhisk) returns a 404 error
        // instead of any data or status. Therefore, we will return a status of 'running' to inform the client to wait.
        return {
          jobId,
          status: STATUS_RUNNING,
        };
      }
      throw error;
    }
  }
}

exports.main = asGenericAction(asAuthAction(main));
