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
import {
  createPromptMigrator,
  reconcileCustomPromptTemplates,
} from './PromptTemplatesState.js';
import { readValueFromSettings, writeValueToSettings } from '../helpers/SettingsHelper.js';
import { RUN_MODE_DEFAULT } from './RunMode.js';

jest.mock('../helpers/SettingsHelper.js');

describe('createPromptMigrator', () => {
  it('adds modes property if it does not exist', () => {
    const prompt = {
      id: '1',
      label: 'Test prompt',
      description: 'This is a test prompt',
      template: 'Test template',
    };

    const migrator = createPromptMigrator();
    const migratedPrompt = migrator(prompt);

    expect(migratedPrompt).toEqual({
      ...prompt,
      modes: [RUN_MODE_DEFAULT],
    });
  });

  it('does not change prompt if modes property exists', () => {
    const prompt = {
      id: '1',
      label: 'Test prompt',
      description: 'This is a test prompt',
      template: 'Test template',
      modes: ['existingMode'],
    };

    const migrator = createPromptMigrator();
    const migratedPrompt = migrator(prompt);

    expect(migratedPrompt).toEqual(prompt);
  });
});

describe('reconcileCustomPromptTemplates', () => {
  const existingTemplates = [
    { id: '1', modes: [RUN_MODE_DEFAULT], label: 'Existing Template' },
    { id: '2', modes: [RUN_MODE_DEFAULT], label: 'Template to Delete' },
  ];
  const templatesToUpsert = [
    { id: '3', modes: [RUN_MODE_DEFAULT], label: 'New Template' },
  ];
  const templatesToDelete = [
    { id: '2', modes: [RUN_MODE_DEFAULT], label: 'Template to Delete' },
  ];

  beforeEach(() => {
    readValueFromSettings.mockResolvedValueOnce({ promptTemplates: existingTemplates });
    readValueFromSettings.mockResolvedValueOnce({ promptTemplates: [] });
    writeValueToSettings.mockResolvedValue(undefined);
  });

  it('should upsert templates and delete none when templatesToDelete is empty', async () => {
    const result = await reconcileCustomPromptTemplates(templatesToUpsert, [], RUN_MODE_DEFAULT);

    expect(result.map((item) => item.id)).toEqual(['1', '2', '3']);
  });

  it('should delete templates and upsert none when templatesToUpsert is empty', async () => {
    const result = await reconcileCustomPromptTemplates([], templatesToDelete, RUN_MODE_DEFAULT);

    expect(result.map((item) => item.id)).toEqual(['1']);
  });

  it('should upsert and delete templates when both templatesToUpsert and templatesToDelete are not empty', async () => {
    const result = await reconcileCustomPromptTemplates(
      templatesToUpsert,
      templatesToDelete,
      RUN_MODE_DEFAULT,
    );

    expect(result.map((item) => item.id)).toEqual(['1', '3']);
  });
});
