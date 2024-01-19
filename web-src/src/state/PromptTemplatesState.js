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
  isBundled: true,
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

async function fetchUserPromptTemplates(aemHost, promptTemplatesPath, endpoint, accessToken) {
  try {
    console.debug('Fetching prompt templates from', endpoint);
    const json = await wretchRetry(endpoint)
      .post({
        command: 'getPromptTemplates',
        aemHost,
        promptTemplatesPath,
        accessToken,
      })
      .json();
    return parsePromptTemplates(json.map((entry) => {
      return {
        Label: entry[0],
        Description: entry[1],
        Template: entry[2],
      };
    }, false));
  } catch (e) {
    return [];
  }
}

export async function loadPromptTemplates(aemHost, promptTemplatesPath, endpoint, accessToken) {
  return [
    ...(parsePromptTemplates(bundledPromptTemplates, true)),
    ...(await fetchUserPromptTemplates(aemHost, promptTemplatesPath, endpoint, accessToken)),
    newPromptTemplate,
  ];
}

export async function savePromptTemplates(aemHost, promptTemplatesPath, promptTemplates, endpoint, accessToken) {
  const userPromptTemplates = Array.from(promptTemplates).filter((template) => !template.isBundled);
  try {
    console.debug('Saving prompt templates to', endpoint);
    console.debug('Prompt templates', userPromptTemplates.map(({ label, description, template }) => {
      return [label, description, template];
    }));
    await wretchRetry(endpoint)
      .post({
        command: 'savePromptTemplates',
        aemHost,
        promptTemplatesPath,
        accessToken,
        promptTemplates: userPromptTemplates.map(({
          label, description, template,
        }) => {
          return [label, description, template];
        }),
      })
      .res();
  } catch (e) {
    console.error('Failed to save prompt templates', e);
  }
}

export const promptTemplatesState = atom({
  key: 'promptTemplatesState',
  default: [],
});
