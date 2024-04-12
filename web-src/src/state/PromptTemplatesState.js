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

import bundledPromptTemplatesJson from '../../../data/bundled-prompt-templates.json';
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

function createPromptTemplatesWrapper(templates) {
  return {
    promptTemplates: templates,
  };
}

export function parseBundledPromptTemplates(runMode) {
  return bundledPromptTemplatesJson
    .filter(({ modes }) => modes.includes(runMode))
    .map((prompt) => {
      return {
        id: uuid(),
        label: prompt.label,
        description: prompt.description,
        template: prompt.template || '',
        isShared: true,
        isBundled: true,
        created: null,
        lastModified: null,
        createdBy: null,
        lastModifiedBy: null,
      };
    });
}

function createPromptMigrator(defaultRunMode) {
  return (prompt) => {
    if (!prompt.modes) {
      return {
        ...prompt,
        modes: [defaultRunMode],
      };
    }
    return prompt;
  };
}

function settingsToPromptTemplates(settings, isShared, runMode, defaultRunMode) {
  return settings.promptTemplates
    .map(createPromptMigrator(defaultRunMode))
    .filter(({ modes }) => modes.includes(runMode))
    .map((prompt) => {
      return {
        id: prompt.id,
        label: prompt.label,
        description: prompt.description,
        template: prompt.template,
        isShared,
        isBundled: false,
        created: prompt.created ?? new Date().getTime(),
        lastModified: prompt.lastModified ?? new Date().getTime(),
        createdBy: prompt.createdBy,
        lastModifiedBy: prompt.lastModifiedBy,
      };
    });
}

function promptTemplatesToSettings(promptTemplates, isSharedTemplate, runMode) {
  const settings = promptTemplates
    .filter(({ isShared }) => isSharedTemplate === isShared)
    .map((prompt) => {
      return {
        id: prompt.id,
        label: prompt.label,
        description: prompt.description,
        template: prompt.template,
        modes: [runMode],
        created: prompt.created,
        lastModified: prompt.lastModified,
        createdBy: prompt.createdBy,
        lastModifiedBy: prompt.lastModifiedBy,
      };
    });
  return createPromptTemplatesWrapper(settings);
}

export async function readCustomPromptTemplates(runMode, defaultRunMode) {
  const privateSettings = await readValueFromSettings(
    PROMPT_TEMPLATE_STORAGE_KEY,
    createPromptTemplatesWrapper([]),
    false,
  );
  const privatePromptTemplates = settingsToPromptTemplates(privateSettings, false, runMode, defaultRunMode);
  const publicSettings = await readValueFromSettings(
    PROMPT_TEMPLATE_STORAGE_KEY,
    createPromptTemplatesWrapper([]),
    true,
  );
  const publicPromptTemplates = settingsToPromptTemplates(publicSettings, true, runMode, defaultRunMode);
  return [
    ...privatePromptTemplates,
    ...publicPromptTemplates,
  ];
}

export async function writeCustomPromptTemplates(promptTemplates, runMode) {
  const publicSettings = promptTemplatesToSettings(promptTemplates, true, runMode);
  await writeValueToSettings(PROMPT_TEMPLATE_STORAGE_KEY, publicSettings, true);
  const privateSettings = promptTemplatesToSettings(promptTemplates, false, runMode);
  await writeValueToSettings(PROMPT_TEMPLATE_STORAGE_KEY, privateSettings, false);
}

export const bundledPromptTemplatesState = atom({
  key: 'bundledPromptTemplatesState',
  default: [],
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
