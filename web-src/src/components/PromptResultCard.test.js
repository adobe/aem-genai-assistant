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
import { extractMetadataFields } from './PromptResultCard.js';

describe('extractMetadataFields', () => {
  it('should correctly extract metadata fields from an object', () => {
    const input = {
      ai_rationale: 'AI generated content',
      'variation name': 'Variant 1',
      otherField: 'value1',
      anotherField: 'value2',
    };

    const expectedOutput = {
      resultFields: {
        otherField: 'value1',
        anotherField: 'value2',
      },
      metadataFields: {
        aiRationale: 'AI generated content',
        variationName: 'Variant 1',
      },
    };

    expect(extractMetadataFields(input)).toEqual(expectedOutput);
  });

  it('should skip parsing non-object arguments', () => {
    const input = 'some string instead of an object';

    const expectedOutput = {};

    expect(extractMetadataFields(input)).toEqual(expectedOutput);
  });
});
