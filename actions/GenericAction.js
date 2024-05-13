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

const { Core } = require('@adobe/aio-sdk');
const InternalError = require('./InternalError.js');

const logger = Core.Logger('GenericAction');

function createResponse(status, body) {
  return {
    headers: { 'Content-Type': 'application/json' },
    statusCode: status,
    body,
  };
}

function isObject(obj) {
  return typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
}

function createSuccessResponse(body) {
  if (!isObject(body)) {
    return createResponse(200, body);
  }

  // If there is a status code in the body, use it; otherwise, default to 200.
  const { statusCode, ...response } = body;
  return createResponse(statusCode ?? 200, response);
}

function createErrorResponse(status, message) {
  return createResponse(status, { error: message });
}

function getActionNameAndVersion() {
  const { __OW_ACTION_NAME, __OW_ACTION_VERSION } = process.env;
  return `${__OW_ACTION_NAME}:${__OW_ACTION_VERSION}`;
}

function asGenericAction(action) {
  return async (params) => {
    const startTime = Date.now();
    try {
      return createSuccessResponse(await action(params));
    } catch (e) {
      if (e instanceof InternalError) {
        logger.error(`Internal error: ${e.message} (${e.status})`);
        return createErrorResponse(e.status, e.message);
      }
      logger.error(`Unexpected error: ${e.message}`);
      return createErrorResponse(500, e.message ?? 'Internal Server Error');
    } finally {
      logger.info(`Execution time for action ${getActionNameAndVersion()}: ${Date.now() - startTime}ms`);
    }
  };
}

module.exports = { asGenericAction };
