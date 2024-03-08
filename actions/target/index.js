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
const wretch = require('wretch');
const { asGenericAction } = require('../GenericAction.js');

const MIN_DESCRIPTION_LENGTH = 5;

async function main({ __ow_headers: headers, org, TARGET_API_KEY }) {
  const { authorization } = headers;
  const accessToken = authorization.split(' ')[1];

  const json = await wretch(`https://mc.adobe.io/${org}/target/audiences`)
    .headers({
      'x-api-key': TARGET_API_KEY,
    })
    .auth(`Bearer ${accessToken}`)
    .accept('application/vnd.adobe.target.v3+json')
    .get()
    .json();

  if (!json.audiences) {
    throw new Error('Failed to fetch audiences');
  }

  return json.audiences
    .filter((audience) => audience.name && audience.type === 'reusable')
    .map((audience) => ({
      id: audience.id,
      name: audience.name.trim(),
      description: audience.description?.length > MIN_DESCRIPTION_LENGTH ? audience.description.trim() : null,
    }));
}

exports.main = asGenericAction(main);
