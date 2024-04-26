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
import { AemClient } from './AemClient.js';
import wretch from './Network.js';

jest.mock('@adobe/aio-sdk', () => ({
  Core: {
    Logger: jest.fn().mockReturnValue({
      info: jest.fn().mockReturnThis(),
      error: jest.fn().mockReturnThis(),
    }),
  },
}));

jest.mock('./Network.js');

describe('AemClient', () => {
  let client;

  beforeEach(() => {
    client = new AemClient('http://test-endpoint', 'test-token');
    wretch.mockClear();
  });

  it('should fetch fragment', async () => {
    const fragmentId = 'test-fragment-id';
    const mockJsonPromise = Promise.resolve('mocked data');
    wretch.mockReturnValue({
      headers: jest.fn().mockReturnThis(),
      get: jest.fn(() => ({
        json: () => mockJsonPromise,
      })),
    });

    const fragment = await client.getFragment(fragmentId);

    expect(wretch).toHaveBeenCalledWith(`http://test-endpoint/adobe/sites/cf/fragments/${fragmentId}`);
    expect(fragment).toBe('mocked data');
  });

  it('should fetch fragment model', async () => {
    const modelId = 'test-model-id';
    const mockJsonPromise = Promise.resolve('mocked data');
    wretch.mockReturnValue({
      headers: jest.fn().mockReturnThis(),
      get: jest.fn(() => ({
        json: () => mockJsonPromise,
      })),
    });

    const model = await client.getFragmentModel(modelId);

    expect(wretch).toHaveBeenCalledWith(`http://test-endpoint/adobe/sites/cf/models/${modelId}`);
    expect(model).toBe('mocked data');
  });

  it('should create fragment variation', async () => {
    const fragmentId = 'test-fragment-id';
    const variationName = 'test-variation-name';
    const content = { field1: 'value1', field2: 'value2' };

    const mockJsonPromise = Promise.resolve({
      name: variationName,
      fields: [
        { name: 'field1', values: ['value1'] },
        { name: 'field2', values: ['value2'] },
      ],
    });

    const mockResPromise = Promise.resolve({
      headers: { get: () => 'mocked-etag' },
      json: () => mockJsonPromise,
    });

    const mockPost = jest.fn(() => ({
      res: () => mockResPromise,
    }));

    const mockPatch = jest.fn(() => ({
      res: () => mockResPromise,
    }));

    wretch.mockReturnValue({
      headers: jest.fn().mockReturnThis(),
      post: mockPost,
      patch: mockPatch,
    });

    await client.createFragmentVariation(fragmentId, variationName, content);

    expect(wretch).toHaveBeenCalledWith(`http://test-endpoint/adobe/sites/cf/fragments/${fragmentId}/variations`);
    expect(mockPost).toHaveBeenCalledWith({
      title: variationName,
    });
    expect(mockPatch).toHaveBeenCalledWith([
      { op: 'replace', path: '/fields/0/values', value: ['value1'] },
      { op: 'replace', path: '/fields/1/values', value: ['value2'] },
    ]);
  });
});
