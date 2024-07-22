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
const { truncateText } = require('./StringUtils.js');

describe('truncateText', () => {
  test('returns the original text if text length is less than or equal to maxLength', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
    expect(truncateText('Short text.', 11)).toBe('Short text.');
  });

  test('truncates the text to maxLength and appends ellipsis if there is no period or space', () => {
    expect(truncateText('ThisIsAVeryLongWordThatExceedsMaxLength', 10)).toBe('ThisIsAVer...');
  });

  test('truncates the text at the last period if it is within maxLength', () => {
    expect(truncateText('This is a test. This should be truncated.', 20)).toBe('This is a test.');
  });

  test('truncates the text at the last space within maxLength and appends ellipsis', () => {
    expect(truncateText('This is a test of truncation', 20)).toBe('This is a test of...');
  });

  test('adds ellipsis if the truncated text has no space or period', () => {
    expect(truncateText('HelloWorld', 5)).toBe('Hello...');
  });

  test('handles empty string', () => {
    expect(truncateText('', 5)).toBe('');
  });

  test('handles text with no spaces or periods', () => {
    expect(truncateText('abcdefghij', 5)).toBe('abcde...');
  });

  test('handles text with multiple periods', () => {
    expect(truncateText('Hello. This is a test. Here is another sentence.', 25)).toBe('Hello. This is a test.');
  });

  test('handles text with periods at the very end of maxLength', () => {
    expect(truncateText('Hello. This is a test.', 22)).toBe('Hello. This is a test.');
  });
});
