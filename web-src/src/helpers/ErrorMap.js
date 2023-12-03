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

const AIO_ERROR_CODES = {
  default: 'An error occurred while generating results',
};

const FIREFALL_ERROR_CODES = {
  default: 'An error occurred while generating results',
  400: "The response was filtered due to the prompt triggering Azure OpenAI's content management policy. Please modify your prompt and retry. To learn more about our content filtering policies please read Azure's documentation: https://go.microsoft.com/fwlink/?linkid=2198766",
  429: 'OpenAI Rate limit exceeded. Please wait one minute and try again.',
};

const IMS_ERROR_CODES = {
  default: 'An error occurred while authenticating with Adobe',
  invalid: 'The token is invalid (401)',
  invalid_request: 'Creating an access token failed due to internal errors (invalid_request)',
  invalid_client: 'Client credentials are not correct (401)',
  unsupported_grant_type: 'Client not configured for this grant type (403)',
  unauthorized_client: 'The client_id does not have the appropriate grant_type set (403)',
  access_denied: 'Device token is invalid (or expired) or was released for a different device ID (401)',
  invalid_scope: 'The client is not configured for the requested scope (403)',
};

function getErrorMessage(errorCode, errorMap) {
  return errorMap[String(errorCode)] || errorMap.default;
}

export function getErrorResponse(error) {
  const errorOrigin = error.json.origin;
  let errorMessage = null;

  switch (errorOrigin) {
    case 'AIO':
      errorMessage = getErrorMessage(error.status, AIO_ERROR_CODES);
      return `AIO-Error: ${errorMessage} (${error.status}).`;
    case 'FIREFALL':
      errorMessage = getErrorMessage(error.status, FIREFALL_ERROR_CODES);
      return `IS-Error: ${errorMessage} (${error.status}).`;
    case 'IMS':
      errorMessage = getErrorMessage(error.json.error, IMS_ERROR_CODES);
      return `IMS-Error: ${errorMessage}.`;
    default:
      return 'AEM-Error: An unknown error ocurred.';
  }
}
