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
import { selector } from 'recoil';
import { wretchRetry } from '../../../actions/Network.js';
import { configurationState } from './ConfigurationState.js';

function parsePromptTemplates(data) {
  return data.map(({
    Label, Description, Prompt, Template,
  }) => {
    return {
      label: Label,
      description: Description,
      template: Prompt || Template || '',
    };
  });
}

function parsePlaceholders(data) {
  return data.reduce((acc, row) => {
    const {
      Name, Type, Label, Description, Default, Options,
    } = row;
    return {
      ...acc,
      [Name]: {
        type: Type === 'select' ? 'spreadsheet' : Type,
        label: Label,
        description: Description,
        default: Default,
        options: Options,
        spreadsheet: Type === 'select' ? Options : undefined,
      },
    };
  }, {});
}

export const promptTemplateLibraryState = selector({
  key: 'promptTemplateLibraryState',

  get: async ({ get }) => {
    try {
      const { websiteUrl, promptTemplateLibraryPath } = get(configurationState);
      const url = `${websiteUrl}/${promptTemplateLibraryPath.toLowerCase()}.json`;

      const {
        ':type': type, data, prompts, placeholders,
      } = await wretchRetry(url).get().json();

      if (type === 'sheet') {
        return {
          promptTemplates: parsePromptTemplates(data),
          placeholders: {},
        };
      } else if (type === 'multi-sheet') {
        return {
          promptTemplates: parsePromptTemplates(prompts.data),
          placeholders: parsePlaceholders(placeholders.data),
        };
      } else {
        throw new Error(`Unknown prompt template library type: ${type}`);
      }
    } catch (e) {
      console.error(e);
      throw new Error('Unable to load prompt template library');
    }
  },
});
