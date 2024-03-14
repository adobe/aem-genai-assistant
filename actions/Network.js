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
const AbortAddon = require('wretch/addons/abort');

const wretch = require('wretch');
const { Core } = require('@adobe/aio-sdk');

const REQUEST_TIMEOUT = 55 * 1000;

const logger = Core.Logger('FirefallAction');

class NetworkError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'NetworkError';
    this.status = status;
  }
}

function wretchWithOptions(url) {
  return wretch(url)
    .addon(AbortAddon())
    .resolve((_) => _.setTimeout(REQUEST_TIMEOUT))
    .resolve((_) => {
      return _.fetchError((error) => {
        if (error.name === 'AbortError') {
          logger.error('Request aborted', error);
          throw new NetworkError(408, 'Request timed out');
        }
        logger.error('Network error', error);
        throw new NetworkError(500, 'Network error');
      });
    });
}

module.exports = { wretch: wretchWithOptions, NetworkError };
