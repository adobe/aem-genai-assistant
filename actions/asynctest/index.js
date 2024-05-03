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

const { Core } = require('@adobe/aio-sdk');

const TIMEOUT = 90000; // in ms (90 sec)

function main(params) {
  const logger = Core.Logger('asynctest', { level: params.LOG_LEVEL || 'info' });

  const start = new Date();

  logger.info('Calling asynctest ...');

  logger.debug(`Params: ${JSON.stringify(params, null, 2)}`);

  logger.info('Complete');

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const end = new Date();
      const delta = (end.getTime() - start.getTime()) / 1000;

      const result = {
        statusCode: 200,
        body: {
          payload: 'Hello from the long running job!',
          duration: delta,
        },
      };
      resolve(result);
    }, TIMEOUT);
  });
}

exports.main = main;
