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

const openwhisk = require('openwhisk');
const { Core } = require('@adobe/aio-sdk');

async function main(params) {
  const { activationId, LOG_LEVEL: logLevel } = params;

  const logger = Core.Logger('test', { level: logLevel || 'info' });

  try {
    logger.info('Calling test ...');

    const ow = openwhisk();

    logger.debug(`Params: ${JSON.stringify(params, null, 2)}`);

    if (!activationId) {
      const activation = await ow.actions.invoke({
        name: 'aem-genai-assistant/asynctest',
        blocking: false,
        result: false,
      });

      logger.debug(`Activation ID: ${activation.activationId}`);

      logger.info('Complete');

      return {
        statusCode: 200,
        body: {
          activationId: activation.activationId,
        },
      };
    } else {
      const result = await ow.activations.get(activationId);

      logger.debug(`Activation ID result: ${JSON.stringify(result, null, 2)}`);

      return {
        statusCode: 200,
        body: result,
      };
    }
  } catch (error) {
    logger.error(error);

    return {
      statusCode: 500,
      body: {
        error,
      },
    };
  }
}

exports.main = main;
