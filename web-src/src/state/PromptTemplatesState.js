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
import { v4 as uuid } from 'uuid';

import { data as bundledPromptTemplatesJson } from '../../../data/bundledPromptTemplates.json';
import { readValueFromSettings, writeValueToSettings } from '../helpers/SettingsHelper.js';

export const NEW_PROMPT_TEMPLATE_ID = 'new-prompt';

export const PROMPT_TEMPLATE_STORAGE_KEY = 'promptTemplates';

export const newPromptTemplate = {
  id: NEW_PROMPT_TEMPLATE_ID,
  label: 'New prompt',
  description: 'To start a new prompt use this and then add it to your prompt templates for future use.',
  template: '',
  isShared: true,
  isBundled: false,
};

function createPromptTemplatesEnvelope(templates) {
  return {
    promptTemplates: templates,
  };
}

function parseBundledPromptTemplates(data) {
  return data.map(({
    Label, Description, Template,
  }) => {
    return {
      id: uuid(),
      label: Label,
      description: Description,
      template: Template || '',
      isShared: true,
      isBundled: true,
      created: null,
      lastModified: null,
      createdBy: null,
      lastModifiedBy: null,
    };
  });
}

function settingsToPromptTemplates(settings, isShared) {
  return settings.promptTemplates.map(({
    id, label, description, template, created, lastModified, createdBy, lastModifiedBy,
  }) => {
    return {
      id,
      label,
      description,
      template,
      isShared,
      isBundled: false,
      created: created ?? new Date().getTime(),
      lastModified: lastModified ?? new Date().getTime(),
      createdBy,
      lastModifiedBy,
    };
  });
}

function promptTemplatesToSettings(promptTemplates, isPublicTemplate) {
  const settings = promptTemplates
    .filter(({ isShared }) => isPublicTemplate === isShared)
    .map(({
      id, label, description, template, created, lastModified, createdBy, lastModifiedBy,
    }) => {
      return {
        id,
        label,
        description,
        template,
        created,
        lastModified,
        createdBy,
        lastModifiedBy,
      };
    });
  return createPromptTemplatesEnvelope(settings);
}

export async function readCustomPromptTemplates() {
  const privateSettings = await readValueFromSettings(
    PROMPT_TEMPLATE_STORAGE_KEY,
    createPromptTemplatesEnvelope([]),
    true,
  );
  const publicSettings = await readValueFromSettings(
    PROMPT_TEMPLATE_STORAGE_KEY,
    createPromptTemplatesEnvelope([]),
    false,
  );
  const privatePromptTemplates = settingsToPromptTemplates(privateSettings, false);
  const publicPromptTemplates = settingsToPromptTemplates(publicSettings, true);
  return [
    ...privatePromptTemplates,
    ...publicPromptTemplates,
  ];
}

export async function writeCustomPromptTemplates(promptTemplates) {
  const publicSettings = promptTemplatesToSettings(promptTemplates, true);
  await writeValueToSettings(PROMPT_TEMPLATE_STORAGE_KEY, publicSettings, true);
  const privateSettings = promptTemplatesToSettings(promptTemplates, false);
  await writeValueToSettings(PROMPT_TEMPLATE_STORAGE_KEY, privateSettings, false);
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
