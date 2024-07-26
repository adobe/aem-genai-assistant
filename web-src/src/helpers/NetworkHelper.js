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
import wretch from 'wretch';

const getHeaders = () => {
  const ENABLE_EXTRA_LOGGING_PARAM = 'extraLogging';
  const headers = {};
  const params = new URLSearchParams(window.location.search);
  if (params.get(ENABLE_EXTRA_LOGGING_PARAM) === 'true') {
    headers['X-OW-EXTRA-LOGGING'] = 'on';
  }
  return headers;
};

function unwrapError(error) {
  if (error.json?.error) {
    throw new Error(error.json.error);
  }
  console.error(`Unexpected error: ${error}`);
  // This error identifier (enclosed in double curly braces) will be replaced with the actual
  // error message after being processed for localization on the frontend
  throw new Error('{{unexpectedErrorEncountered}}');
}

function wretchWithOptions(url) {
  return wretch(url)
    .headers(getHeaders())
    .resolve((resolver) => {
      return resolver
        .badRequest((err) => unwrapError(err))
        .unauthorized((err) => unwrapError(err))
        .forbidden((err) => unwrapError(err))
        .notFound((err) => unwrapError(err))
        .timeout((err) => unwrapError(err))
        .internalError((err) => unwrapError(err))
        .error(503, (err) => unwrapError(err))
        .fetchError((err) => unwrapError(err));
    });
}

export { wretchWithOptions as wretch };
