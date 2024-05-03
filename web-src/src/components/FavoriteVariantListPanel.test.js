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
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { exportToCsv } from './FavoriteVariantListPanel.js';

jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

jest.mock('papaparse', () => ({
  unparse: jest.fn(),
}));

describe('exportToCsv', () => {
  it('should export the correct data to CSV', () => {
    const variants = [
      {
        content: {
          'AI Rationale': 'Test 1',
          'Other Field': 'Test 2',
        },
      },
      {
        content: {
          AI_Rationale: 'Test 3',
          'Other Field': 'Test 4',
        },
      },
    ];

    const expectedData = [
      {
        'Other Field': 'Test 2',
      },
      {
        'Other Field': 'Test 4',
      },
    ];

    exportToCsv(variants);

    expect(Papa.unparse).toHaveBeenCalledWith(expectedData);
    expect(Papa.unparse).not.toHaveBeenCalledWith(expect.objectContaining({ 'AI Rational': expect.anything() }));
    expect(saveAs).toHaveBeenCalled();
  });
});
