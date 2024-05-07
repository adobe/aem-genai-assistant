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
import { createPromptMigrator } from './PromptTemplatesState.js';

describe('createPromptMigrator', () => {
  const defaultRunMode = 'testMode';

  it('adds modes property if it does not exist', () => {
    const prompt = {
      id: '1',
      label: 'Test prompt',
      description: 'This is a test prompt',
      template: 'Test template',
    };

    const migrator = createPromptMigrator(defaultRunMode);
    const migratedPrompt = migrator(prompt);

    expect(migratedPrompt).toEqual({
      ...prompt,
      modes: [defaultRunMode],
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

    const migrator = createPromptMigrator(defaultRunMode);
    const migratedPrompt = migrator(prompt);

    expect(migratedPrompt).toEqual(prompt);
  });
});
