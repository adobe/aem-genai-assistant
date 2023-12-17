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
import { wretchRetry } from './Network.js';

const { WretchError } = require('wretch');

jest.mock('./Network.js');

const firefall = new FirefallClient('endpoint', 'apiKey', 'org', 'accessToken');
let error;

beforeEach(() => {
  jest.clearAllMocks();

  error = new WretchError('Internal Server Error');
  wretchRetry.mockImplementation(() => ({
    headers: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
    json: jest.fn().mockRejectedValue(error),
  }));
});

describe('FirefallClient', () => {
  test('handles 400 http status in completion method', async () => {
    error.status = 400;
    await expect(firefall.completion('prompt')).rejects.toThrow("IS-ERROR: The response was filtered due to the prompt triggering Azure OpenAI's content management policy. Please modify your prompt and retry. To learn more about our content filtering policies please read Azure's documentation: https://go.microsoft.com/fwlink/?linkid=2198766 (400).");
  });

  test('handles 429 http status in completion method', async () => {
    error.status = 429;
    await expect(firefall.completion('prompt')).rejects.toThrow('IS-ERROR: OpenAI Rate limit exceeded. Please wait one minute and try again (429).');
  });

  test('handless any http status in the feedback method', async () => {
    error.status = 500;
    await expect(firefall.feedback('queryId', 'sentiment')).rejects.toThrow('An error occurred while sending feedback');
  });
});
