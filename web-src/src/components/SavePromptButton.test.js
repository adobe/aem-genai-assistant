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

import { resolveLastModifiedByName } from './SavePromptButton.js';
import { intlMessages } from './PromptSessionSideView.l10n.js';

describe('resolveLastModifiedByName', () => {
  test('formats the name via userFullName when split fields are present', () => {
    const template = {
      lastModifiedBy: 'Jane Doe',
      lastModifiedByFirstName: 'Jane',
      lastModifiedByLastName: 'Doe',
    };
    const formatMessage = jest.fn(() => 'Doe Jane');

    const result = resolveLastModifiedByName(template, formatMessage);

    expect(formatMessage).toHaveBeenCalledWith(intlMessages.promptSessionSideView.userFullName, {
      firstName: 'Jane',
      lastName: 'Doe',
    });
    expect(result).toBe('Doe Jane');
  });

  test('falls back to the legacy combined name when split fields are absent', () => {
    const template = { lastModifiedBy: 'Jane Doe' };
    const formatMessage = jest.fn();

    const result = resolveLastModifiedByName(template, formatMessage);

    expect(formatMessage).not.toHaveBeenCalled();
    expect(result).toBe('Jane Doe');
  });
});
