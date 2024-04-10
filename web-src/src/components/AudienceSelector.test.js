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
import { isTargetEnabled, useGetItemsFromTarget } from './AudienceSelector.js';

jest.mock('./ApplicationProvider.js');

describe('isTargetEnabled', () => {
  test('returns true for "true" (case insensitive) with or without spaces', () => {
    expect(isTargetEnabled('true')).toBe(true);
    expect(isTargetEnabled(' TRUE ')).toBe(true);
  });

  test('returns true for "1" with or without spaces', () => {
    expect(isTargetEnabled('1')).toBe(true);
    expect(isTargetEnabled(' 1 ')).toBe(true);
  });

  test('returns true for "yes" (case insensitive) with or without spaces', () => {
    expect(isTargetEnabled('yes')).toBe(true);
    expect(isTargetEnabled(' YES ')).toBe(true);
  });

  test('returns false for "false"', () => {
    expect(isTargetEnabled('false')).toBe(false);
  });

  test('returns false for "0"', () => {
    expect(isTargetEnabled('0')).toBe(false);
  });

  test('returns false for "no"', () => {
    expect(isTargetEnabled('no')).toBe(false);
  });

  test('returns false for undefined', () => {
    expect(isTargetEnabled(undefined)).toBe(false);
  });

  test('returns false for null', () => {
    expect(isTargetEnabled(null)).toBe(false);
  });

  test('returns false for non-string values', () => {
    expect(isTargetEnabled(123)).toBe(false);
    expect(isTargetEnabled({})).toBe(false);
    expect(isTargetEnabled([])).toBe(false);
  });

  test('returns false for string values that do not match "true", "1", or "yes" exactly, even without spaces', () => {
    expect(isTargetEnabled('_True')).toBe(false);
    expect(isTargetEnabled('Yes.')).toBe(false);
  });
});

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
