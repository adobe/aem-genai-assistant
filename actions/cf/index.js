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
const Papa = require('papaparse');
const wretch = require('wretch');
const { retry } = require('wretch/middlewares/retry');
const { asGenericAction } = require('../GenericAction.js');

function wretchRetry(url) {
  return wretch(url)
    .middlewares([retry({
      retryOnNetworkError: true,
      maxAttempts: 3,
      resolveWithLatestResponse: true,
      until: (response) => response && response.ok,
    })]);
}

async function getPromptTemplates(params) {
  const { aemHost, promptTemplatesPath, accessToken } = params;
  try {
    const url = `${aemHost}/${promptTemplatesPath}`;
    console.debug('Fetching prompt templates from', url);
    const csvData = await wretch(url)
      .headers({
        Accept: 'text/csv',
        Authorization: `Bearer ${accessToken}`,
      })
      .get()
      .text();
    return Papa.parse(csvData, { skipEmptyLines: true }).data;
  } catch (error) {
    throw new Error(`Unable to get prompt templates: ${error.message}`);
  }
}

async function savePromptTemplates(params) {
  const {
    aemHost, promptTemplatesPath, promptTemplates, accessToken,
  } = params;
  try {
    const url = `${aemHost}/${promptTemplatesPath}`;
    console.debug('Saving prompt templates to', url);
    return await wretch(url)
      .headers({
        'Content-Type': 'text/csv',
        Authorization: `Bearer ${accessToken}`,
      })
      .put(Papa.unparse(promptTemplates))
      .res();
  } catch (error) {
    throw new Error(`Unable to save prompt templates: ${error.message}`);
  }
}

async function getFragment(params) {
  const { aemHost, fragmentId, accessToken } = params;
  try {
    const url = `${aemHost}/adobe/sites/cf/fragments/${fragmentId}`;
    console.debug('Fetching fragment from', url);
    return await wretch(url)
      .headers({
        'X-Adobe-Accept-Unsupported-API': '1',
        Authorization: `Bearer ${accessToken}`,
      })
      .get()
      .json();
  } catch (error) {
    throw new Error(`Unable to get fragment: ${error.message}`);
  }
}

async function getModel(params) {
  const { aemHost, modelId, accessToken } = params;
  try {
    const url = `${aemHost}/adobe/sites/cf/models/${modelId}`;
    console.debug('Fetching model from', url);
    return await wretch(url)
      .headers({
        'X-Adobe-Accept-Unsupported-API': '1',
        Authorization: `Bearer ${accessToken}`,
      })
      .get()
      .json();
  } catch (error) {
    throw new Error(`Unable to get model: ${error.message}`);
  }
}

async function getAllModels(params) {
  const { aemHost, accessToken } = params;
  try {
    return await wretch(`${aemHost}/adobe/sites/cf/models`)
      .headers({
        'X-Adobe-Accept-Unsupported-API': '1',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      })
      .get()
      .json();
  } catch (error) {
    throw new Error(`Unable to get all models: ${error.message}`);
  }
}

async function createVariation(params) {
  const {
    aemHost, fragmentId, variationName, content, accessToken,
  } = params;
  try {
    const createVariationUrl = `${aemHost}/adobe/sites/cf/fragments/${fragmentId}/variations`;
    console.debug('Creating variation at', createVariationUrl);
    const createVariationResponse = await wretchRetry(createVariationUrl)
      .headers({
        'X-Adobe-Accept-Unsupported-API': '1',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      })
      .post({ title: variationName })
      .res();
    const eTag = createVariationResponse.headers.get('ETag');
    const variation = await createVariationResponse.json();
    const editVariationUrl = `${aemHost}/adobe/sites/cf/fragments/${fragmentId}/variations/${variation.name}`;
    console.debug('Editing variation at', editVariationUrl);
    const patchPayload = variation.fields.map((field, index) => ({
      op: 'replace',
      path: `/fields/${index}/values`,
      value: [content[field.name]],
    }));
    await wretchRetry(editVariationUrl)
      .headers({
        'X-Adobe-Accept-Unsupported-API': '1',
        'If-Match': eTag,
        'Content-Type': 'application/json-patch+json',
        Authorization: `Bearer ${accessToken}`,
      })
      .patch(patchPayload)
      .json();
    return patchPayload;
  } catch (error) {
    throw new Error(`Unable to create variation: ${error.message}`);
  }
}

async function main(params) {
  switch (params.command) {
    case 'getPromptTemplates':
      return getPromptTemplates(params);
    case 'savePromptTemplates':
      return savePromptTemplates(params);
    case 'getFragment':
      return getFragment(params);
    case 'getModel':
      return getModel(params);
    case 'getAllModels':
      return getAllModels(params);
    case 'createVariation':
      return createVariation(params);
    default:
      throw new Error(`Unknown command: ${params.command}`);
  }
}

exports.main = asGenericAction(main);
