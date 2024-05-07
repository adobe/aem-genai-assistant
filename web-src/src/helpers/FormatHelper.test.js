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
import { formatIdentifier } from './FormatHelper.js';

describe('formatIdentifier', () => {
  it('should format the identifier correctly', () => {
    const input = 'testIdentifier';
    const expectedOutput = 'Test identifier';
    expect(formatIdentifier(input)).toEqual(expectedOutput);
  });

  it('should handle identifiers with hyphens and underscores', () => {
    const input = 'test-identifier_with_mixed-format';
    const expectedOutput = 'Test identifier with mixed format';
    expect(formatIdentifier(input)).toEqual(expectedOutput);
  });

  it('should handle identifiers with camelCase', () => {
    const input = 'testIdentifierWithCamelCase';
    const expectedOutput = 'Test identifier with camel case';
    expect(formatIdentifier(input)).toEqual(expectedOutput);
  });
});
