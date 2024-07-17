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
import { createContentModelPrompt } from './PromptRenderer.js';

describe('createContentModelPrompt', () => {
  it('should return a formatted string with field names and descriptions', () => {
    const contentFragmentModel = {
      fields: [
        {
          type: 'text', name: 'field1', description: 'desc1', label: 'label1',
        },
        { type: 'text', name: 'field2', label: 'label2' },
        { type: 'image', name: 'field3', description: 'desc3' },
      ],
    };

    const expectedOutput = '\n\nAdditional requirements: ```'
      + '\nThe response MUST be formatted as a JSON array.'
      + '\nEach element of MUST be a JSON object that includes the following fields: '
      + '\n  - name: "field1"'
      + '\n    description: "desc1"'
      + '\n  - name: "field2"'
      + '\n    description: "label2"'
      + '\n  - name: "variationName"'
      + '\n    description: "The name assigned to the variation that should accurately represent the content\'s intent."'
      + '\n```';

    expect(createContentModelPrompt(contentFragmentModel)).toEqual(expectedOutput);
  });
});
