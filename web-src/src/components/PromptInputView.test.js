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
import { toCamelCaseKeys } from './PromptInputView.js';

describe('toCamelCaseKeys', () => {
  it('converts snake_case keys to camelCase', () => {
    const snakeCaseObj = {
      first_name: 'John',
      last_name: 'Doe',
    };

    const expectedObj = {
      firstName: 'John',
      lastName: 'Doe',
    };

    expect(toCamelCaseKeys(snakeCaseObj)).toEqual(expectedObj);
  });

  it('converts kebab-case keys to camelCase', () => {
    const kebabCaseObj = {
      'first-name': 'Jane',
      'last-name': 'Doe',
    };

    const expectedObj = {
      firstName: 'Jane',
      lastName: 'Doe',
    };

    expect(toCamelCaseKeys(kebabCaseObj)).toEqual(expectedObj);
  });

  it('leaves already camelCase keys unchanged', () => {
    const camelCaseObj = {
      firstName: 'John',
      lastName: 'Doe',
    };

    expect(toCamelCaseKeys(camelCaseObj)).toEqual(camelCaseObj);
  });

  it('handles mixed cases keys correctly', () => {
    const mixedCaseObj = {
      'first-name': 'John',
      last_name: 'Doe',
      Age: 30,
    };

    const expectedObj = {
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
    };

    expect(toCamelCaseKeys(mixedCaseObj)).toEqual(expectedObj);
  });
});
