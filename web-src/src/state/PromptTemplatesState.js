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
import { atom, selector } from 'recoil';

import { data as bundledPromptTemplatesJson } from '../../../data/bundledPromptTemplates.json';
import { readValueFromSettings, writeValueToSettings } from '../helpers/SettingsHelper.js';

export const NEW_PROMPT_TEMPLATE_ID = 'new-prompt';

export const PROMPT_TEMPLATE_STORAGE_KEY = 'promptTemplates';

export const newPromptTemplate = {
  id: NEW_PROMPT_TEMPLATE_ID,
  label: 'New prompt',
  description: 'To start a new prompt use this and then add it to your prompt templates for future use.',
  template: '',
  isPrivate: false,
  isBundled: false,
};

function newPromptTemplatesWrapper(templates) {
  return {
    promptTemplates: templates,
  };
}

function parseBundledPromptTemplates(data) {
  return data.map(({
    Label, Description, Template,
  }) => {
    return {
      label: Label,
      description: Description,
      template: Template || '',
      isPrivate: false,
      isBundled: true,
    };
  });
}

function settingsToPromptTemplates(settings, isPrivate) {
  return settings.promptTemplates.map(({
    id, label, description, template,
  }) => {
    return {
      id,
      label,
      description,
      template,
      isPrivate,
      isBundled: false,
    };
  });
}

function promptTemplatesToSettings(promptTemplates, isPrivate) {
  const settings = promptTemplates
    .filter(({
      isPrivate: isPrivateTemplate,
    }) => isPrivateTemplate === isPrivate)
    .map(({
      id, label, description, template,
    }) => {
      return {
        id,
        label,
        description,
        template,
      };
    });
  return newPromptTemplatesWrapper(settings);
}

export async function readCustomPromptTemplates() {
  const publicSettings = await readValueFromSettings(PROMPT_TEMPLATE_STORAGE_KEY, newPromptTemplatesWrapper([]), false);
  const publicPromptTemplates = settingsToPromptTemplates(publicSettings, false);
  const privateSettings = await readValueFromSettings(PROMPT_TEMPLATE_STORAGE_KEY, newPromptTemplatesWrapper([]), true);
  const privatePromptTemplates = settingsToPromptTemplates(privateSettings, true);
  return [
    ...publicPromptTemplates,
    ...privatePromptTemplates,
  ];
}

export async function writeCustomPromptTemplates(promptTemplates) {
  const publicSettings = promptTemplatesToSettings(promptTemplates, false);
  await writeValueToSettings(PROMPT_TEMPLATE_STORAGE_KEY, publicSettings, false);
  const privateSettings = promptTemplatesToSettings(promptTemplates, true);
  await writeValueToSettings(PROMPT_TEMPLATE_STORAGE_KEY, privateSettings, true);
}

const bundledPromptTemplatesState = selector({
  key: 'bundledPromptTemplatesState',
  get: () => parseBundledPromptTemplates(bundledPromptTemplatesJson),
});

export const customPromptTemplatesState = atom({
  key: 'customPromptTemplatesState',
  default: [],
});

export const promptTemplatesState = selector({
  key: 'promptTemplatesState',
  get: async ({ get }) => {
    const bundledPromptTemplates = get(bundledPromptTemplatesState);
    const customPromptTemplates = await get(customPromptTemplatesState);
    return [
      ...bundledPromptTemplates.slice().sort((a, b) => a.label.localeCompare(b.label)),
      ...customPromptTemplates.slice().sort((a, b) => a.label.localeCompare(b.label)),
      newPromptTemplate,
    ];
  },
});
