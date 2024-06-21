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
import wretch from 'wretch';

const DEPLOYMENT_ID = 'gpt-4o';
const API_VERSION = '2023-05-15';

export async function getCompletions(text, temperature, azureOpenAiApiKey, azureOpenAiApiUrl) {
  try {
    const headers = {
      'api-key': azureOpenAiApiKey,
      'Content-Type': 'application/json',
    };

    const data = {
      messages: [{ role: 'user', content: text }],
      temperature,
      max_tokens: 1200,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      n: 1,
    };

    console.log('Calling Azure OpenAI API');

    console.log(`URL: ${azureOpenAiApiUrl}/deployments/${DEPLOYMENT_ID}/chat/completions?api-version=${API_VERSION}`);

    const completions = await wretch(`${azureOpenAiApiUrl}/deployments/${DEPLOYMENT_ID}/chat/completions?api-version=${API_VERSION}`)
      .headers(headers)
      .post(data)
      .json();

    console.log('Azure OpenAI API response received');

    console.log(JSON.stringify(completions));

    return {
      query_id: Math.random().toString(36).substring(7),
      generations: [completions.choices.map((choice) => choice)],
    };
  } catch (e) {
    console.error('Error calling Azure OpenAI API', e);
    throw e;
  }
}
