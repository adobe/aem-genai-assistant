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
import { createVariants } from './ResultsParser.js';

const uuid = () => 123;

describe('createVariants', () => {
  const consoleError = console.error; // save the original console.error function
  beforeEach(() => {
    console.error = jest.fn(); // create a new mock function for each test
  });
  afterAll(() => {
    console.error = consoleError; // restore the original console.error after all tests
  });

  test('response is a JSON string: an array of json objects', () => {
    const response = [
      { key1: 'value1', key2: 'value2' },
      { key3: 'value3', key4: 'value4' },
      null,
      'Hello!',
      '<tag>how</tag> is it going?',
    ];
    expect(createVariants(uuid, JSON.stringify(response))).toEqual([
      { id: 123, content: { key1: 'value1', key2: 'value2' } },
      { id: 123, content: { key3: 'value3', key4: 'value4' } },
      { id: 123, content: 'null' },
      { id: 123, content: 'Hello!' },
      { id: 123, content: 'how is it going?' },
    ]);
    expect(console.error).not.toHaveBeenCalled();
  });

  test('response is a JSON string: an object', () => {
    const response = { key: 'value' };
    expect(createVariants(uuid, JSON.stringify(response))).toEqual([
      { id: 123, content: { key: 'value' } },
    ]);
    expect(console.error).not.toHaveBeenCalled();
  });

  test('response is a string', () => {
    const response = 'Hello! How can I assist you today?';
    expect(createVariants(uuid, response)).toEqual([{ id: 123, content: response }]);
    expect(console.error).toHaveBeenCalledWith('Error encountered while parsing the JSON response string.', response);
  });

  test('The response is an incomplete JSON string of an array of objects: the last incomplete object is stripped, while all others are retained.', () => {
    const response = '[{"Title":"Top-Selling Wireless Headphones"},{"Title":"Spotlight on Wireless Headphones"},{"Tit';
    expect(createVariants(uuid, response)).toEqual([
      { id: 123, content: { Title: 'Top-Selling Wireless Headphones' } },
      { id: 123, content: { Title: 'Spotlight on Wireless Headphones' } },
    ]);
    expect(console.error).toHaveBeenCalledWith('Error encountered while parsing the JSON response string.', response);
  });

  test('The response is an incomplete JSON string representing an object: an empty object is returned.', () => {
    const response = '{"Title":"Top-Selling Wireless Headphones","Body":"Discover their high-';
    expect(createVariants(uuid, response)).toEqual([
      { id: 123, content: {} },
    ]);
    expect(console.error).toHaveBeenCalledWith('Error encountered while parsing the JSON response string.', response);
  });

  test('The response is an incomplete JSON string: a string is returned.', () => {
    const response = 'Top-Selling Wireless Headphones ...';
    expect(createVariants(uuid, response)).toEqual([
      { id: 123, content: response },
    ]);
    expect(console.error).toHaveBeenCalledWith('Error encountered while parsing the JSON response string.', response);
  });
});
