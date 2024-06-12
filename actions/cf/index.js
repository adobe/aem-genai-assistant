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
const { asGenericAction } = require('../GenericAction.js');
const { asAuthNAction } = require('../AuthNAction.js');
const { asAuthZAction } = require('../AuthZAction.js');
const { asAemAction } = require('../AemAction.js');

function getFragment(params) {
  const { aemClient, fragmentId } = params;
  if (!fragmentId) {
    throw new Error('Missing required parameter: fragmentId');
  }
  return aemClient.getFragment(fragmentId);
}

function getFragmentModel(params) {
  const { aemClient, modelId } = params;
  if (!modelId) {
    throw new Error('Missing required parameter: modelId');
  }
  return aemClient.getFragmentModel(modelId);
}

function createFragmentVariation(params) {
  const {
    aemClient, fragmentId, variationName, content,
  } = params;
  if (!fragmentId) {
    throw new Error('Missing required parameter: fragmentId');
  }
  if (!variationName) {
    throw new Error('Missing required parameter: variationName');
  }
  if (!content) {
    throw new Error('Missing required parameter: content');
  }
  return aemClient.createFragmentVariation(fragmentId, variationName, content);
}

async function main(params) {
  switch (params.command) {
    case 'getFragment':
      return getFragment(params);
    case 'getFragmentModel':
      return getFragmentModel(params);
    case 'createFragmentVariation':
      return createFragmentVariation(params);
    default:
      throw new Error(`Unknown command: ${params.command}`);
  }
}

exports.main = asGenericAction(asAuthNAction(asAuthZAction(asAemAction(main))));
