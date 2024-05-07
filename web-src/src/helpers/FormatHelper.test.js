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
import { newGroupingLabelGenerator, formatIdentifier } from './FormatHelper.js';

describe('newGroupingLabelGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = newGroupingLabelGenerator();
  });

  test('returns "Today" for today\'s date', () => {
    const label = generator(new Date());
    expect(label).toEqual('Today');
  });

  test('returns "Yesterday" for yesterday\'s date', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const label = generator(yesterday);
    expect(label).toEqual('Yesterday');
  });

  test('returns "Last 7 days" for a date 6 days ago', () => {
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
    const label = generator(sixDaysAgo);
    expect(label).toEqual('Last 7 days');
  });

  test('returns "Last 30 days" for a date 29 days ago', () => {
    const twentyNineDaysAgo = new Date();
    twentyNineDaysAgo.setDate(twentyNineDaysAgo.getDate() - 29);
    const label = generator(twentyNineDaysAgo);
    expect(label).toEqual('Last 30 days');
  });

  test('returns "Last 90 days" for a date 89 days ago', () => {
    const eightyNineDaysAgo = new Date();
    eightyNineDaysAgo.setDate(eightyNineDaysAgo.getDate() - 89);
    const label = generator(eightyNineDaysAgo);
    expect(label).toEqual('Last 90 days');
  });

  test('returns "Last 6 months" for a date 179 days ago', () => {
    const oneHundredSeventyNineDaysAgo = new Date();
    oneHundredSeventyNineDaysAgo.setDate(oneHundredSeventyNineDaysAgo.getDate() - 179);
    const label = generator(oneHundredSeventyNineDaysAgo);
    expect(label).toEqual('Last 6 months');
  });

  test('returns "Last 12 months" for a date 364 days ago', () => {
    const threeHundredSixtyFourDaysAgo = new Date();
    threeHundredSixtyFourDaysAgo.setDate(threeHundredSixtyFourDaysAgo.getDate() - 364);
    const label = generator(threeHundredSixtyFourDaysAgo);
    expect(label).toEqual('Last 12 months');
  });

  test('returns "Older" for a date 366 days ago', () => {
    const threeHundredSixtySixDaysAgo = new Date();
    threeHundredSixtySixDaysAgo.setDate(threeHundredSixtySixDaysAgo.getDate() - 366);
    const label = generator(threeHundredSixtySixDaysAgo);
    expect(label).toEqual('Older');
  });

  test('returns null for the same date input twice', () => {
    const today = new Date();
    let label = generator(today);
    expect(label).toEqual('Today');
    label = generator(today);
    expect(label).toBeNull();
  });

  test('returns "Today" if 8 hours ago falls within the same day and returns "Yesterday" otherwise', () => {
    const datetime = new Date();
    datetime.setHours(datetime.getHours() - 8);
    const label = generator(datetime);

    datetime.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today.getTime() === datetime.getTime()) {
      expect(label).toEqual('Today');
    } else {
      expect(label).toEqual('Yesterday');
    }
  });

  test('returns "Today" if 16 hours ago falls within the same day and returns "Yesterday" otherwise', () => {
    const datetime = new Date();
    datetime.setHours(datetime.getHours() - 16);
    const label = generator(datetime);

    datetime.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today.getTime() === datetime.getTime()) {
      expect(label).toEqual('Today');
    } else {
      expect(label).toEqual('Yesterday');
    }
  });

  test('returns "Today" if 23 hours ago falls within the same day and returns "Yesterday" otherwise', () => {
    const datetime = new Date();
    datetime.setHours(datetime.getHours() - 23);
    const label = generator(datetime);

    datetime.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today.getTime() === datetime.getTime()) {
      expect(label).toEqual('Today');
    } else {
      expect(label).toEqual('Yesterday');
    }
  });
});

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
