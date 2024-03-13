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
import { FirefallClient } from './FirefallClient.js';
import { NetworkError, wretch } from './Network.js';

// Mock the 'Network.js' module
jest.mock('./Network.js');

// Mock the '@adobe/aio-sdk' module
jest.mock('@adobe/aio-sdk', () => ({
  Core: {
    Logger: jest.fn().mockReturnValue({
      info: jest.fn().mockReturnThis(),
      error: jest.fn().mockReturnThis(),
    }),
  },
}));

let firefall;
let error;

function createFirefallClient() {
  return new FirefallClient('endpoint', 'apiKey', 'org', 'accessToken');
}

function createNetworkError(status) {
  return new NetworkError(status, 'Internal Server Error');
}

beforeEach(() => {
  jest.clearAllMocks();
  firefall = createFirefallClient();
  error = createNetworkError(500);
  wretch.mockImplementation(() => ({
    headers: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
    json: jest.fn().mockRejectedValue(error),
  }));
});

describe('FirefallClient', () => {
  test('handles 400 http status in completion method', async () => {
    error.status = 400;
    await expect(firefall.completion('prompt')).rejects.toThrow("IS-ERROR: The response was filtered due to the prompt triggering Generative AI's content management policy. Please modify your prompt and retry. (400).");
  });

  test('handles 429 http status in completion method', async () => {
    error.status = 429;
    await expect(firefall.completion('prompt')).rejects.toThrow("IS-ERROR: Generative AI's Rate limit exceeded. Please wait one minute and try again. (429).");
  });

  test('handless any http status in the feedback method', async () => {
    error.status = 500;
    await expect(firefall.feedback('queryId', 'sentiment')).rejects.toThrow('An error occurred while sending feedback');
  });
});
