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
import { atom } from 'recoil';

import { data as bundledPromptTemplates } from '../../../data/bundledPromptTemplates.json';
import { wretchRetry } from '../helpers/NetworkHelper.js';

export const newPromptTemplate = {
  label: 'New prompt',
  description: 'To start a new prompt use this and then add it to your prompt templates for future use.',
  template: '',
  isBundled: false,
};

function parsePromptTemplates(data, isBundled) {
  return data.map(({
    Label, Description, Template,
  }) => {
    return {
      label: Label,
      description: Description,
      template: Template || '',
      isBundled,
    };
  });
}

async function fetchUserPromptTemplates(websiteUrl, promptTemplatesPath) {
  try {
    const url = `${websiteUrl}/${promptTemplatesPath.toLowerCase()}.json`;
    console.debug('Fetching prompt templates from', url);
    const { data: promptTemplates } = await wretchRetry(url).get().json();
    return parsePromptTemplates(promptTemplates, false);
  } catch (e) {
    return [];
  }
}

export async function loadPromptTemplates(websiteUrl, promptTemplatesPath) {
  return [
    ...(parsePromptTemplates(bundledPromptTemplates, true)),
    ...(await fetchUserPromptTemplates(websiteUrl, promptTemplatesPath)),
    newPromptTemplate,
  ];
}

export const promptTemplatesState = atom({
  key: 'promptTemplatesState',
  default: [],
});
