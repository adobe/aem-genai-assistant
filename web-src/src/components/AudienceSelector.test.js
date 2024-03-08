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
import { renderHook, waitFor } from '@testing-library/react';
import { useApplicationContext } from './ApplicationProvider.js';
import { useGetItemsFromTarget } from './AudienceSelector.js';

jest.mock('./ApplicationProvider.js');

describe('useGetItemsFromTarget', () => {
  it('should return audiences sorted by description and mapped correctly', async () => {
    const mockAudiences = [
      { name: 'Audience1', description: 'Description1' },
      { name: 'Audience2' },
      { name: 'Audience3', description: 'Description3' },
    ];

    useApplicationContext.mockReturnValue({
      targetService: {
        getAudiences: jest.fn().mockResolvedValue(mockAudiences),
      },
    });

    const { result } = renderHook(() => useGetItemsFromTarget());

    await waitFor(async () => {
      const audiences = await result.current();

      expect(audiences).toEqual([
        { key: 'Audience1', value: 'Description1' },
        { key: 'Audience3', value: 'Description3' },
        { key: 'Audience2', value: undefined },
      ]);
    });
  });
});
