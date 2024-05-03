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
import wretch from './Network.js';

jest.mock('@adobe/aio-sdk', () => ({
  Core: {
    Logger: jest.fn().mockReturnValue({
      info: jest.fn().mockReturnThis(),
      error: jest.fn().mockReturnThis(),
    }),
  },
}));

jest.mock('./Network.js', () => {
  const wretchMock = {
    headers: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
    json: jest.fn().mockResolvedValue({}),
  };
  return jest.fn().mockImplementation(() => wretchMock);
});

describe('FirefallClient', () => {
  const sut = new FirefallClient('endpoint', 'apiKey', 'org', 'accessToken');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handles 400 http status in completion method', async () => {
    wretch().json.mockRejectedValue({ status: 400 });
    await expect(sut.completion('prompt')).rejects.toThrow("IS-ERROR: The response was filtered due to the prompt triggering Generative AI's content management policy. Please modify your prompt and retry. (400).");
  });

  test('handles 429 http status in completion method', async () => {
    wretch().json.mockRejectedValue({ status: 429 });
    await expect(sut.completion('prompt')).rejects.toThrow("IS-ERROR: Generative AI's Rate limit exceeded. Please wait one minute and try again. (429).");
  });

  test('handless any http status in the feedback method', async () => {
    wretch().json.mockRejectedValue({ status: 500 });
    await expect(sut.feedback('queryId', 'sentiment')).rejects.toThrow('An error occurred while sending feedback');
  });
});
