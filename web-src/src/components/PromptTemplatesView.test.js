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
import { createNewSession } from './PromptTemplatesView.js';

jest.spyOn(Date, 'now').mockImplementation(() => 1609459200000); // January 1, 2021

jest.mock('uuid', () => ({ v4: () => '12345-uuid' }));
jest.mock('../helpers/FormatHelper.js', () => ({
  formatTimestamp: (timestamp) => `formatted-${timestamp}`,
}));

describe('createNewSession', () => {
  test('should create a new session with expected properties', () => {
    const label = 'SessionLabel';
    const description = 'This is a test session.';
    const prompt = 'Test prompt';

    const session = createNewSession(label, description, prompt);

    expect(session).toEqual({
      id: '12345-uuid',
      name: 'SessionLabel formatted-1609459200000',
      description: 'This is a test session.',
      timestamp: 1609459200000,
      prompt: 'Test prompt',
      parameters: {},
      results: [],
    });
  });
});
