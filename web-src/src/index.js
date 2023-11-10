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
import ReactDOM from 'react-dom'

import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import App from './components/App'
import {defaultTheme, Provider} from '@adobe/react-spectrum';
import {ApplicationProvider} from './components/ApplicationProvider.js';
import './index.css'
import excApp from '@adobe/exc-app';

import {init} from '@adobe/exc-app';
import wretch from 'wretch';

// https://experience.adobe.com/?devMode=true#/custom-apps/?localDevUrl=https://localhost:9080?referrer=https://genai--express-website--vtsaplin.hlx.page/express/create/flyer

async function completion(accessToken, prompt, model, temperature) {
  const endpoint = 'https://firefall.adobe.io'
  const apiKey = 'gen-ai-experiments'
  const org = 'tsaplin@adobe.com'

  return await wretch(endpoint + '/v1/completions')
    .headers({
      'x-gw-ims-org-id': org,
      'x-api-key': apiKey,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    })
    .post({
      dialogue: {
        question: prompt
      },
      llm_metadata: {
        llm_type: 'azure_chat_openai',
        model_name: model,
        temperature: temperature,
        max_tokens: 4096,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        n: 1
      }
    })
    .json();
}

init((config) => {

  const runtime = excApp();
  runtime.on('ready', ({imsToken, gainsight}) => {
    const pair= gainsight.shellPath.split('?')[1];
    window.referrer = pair.split('=')[1];

    console.log('\n\n-----------------');
    console.log('\n   IMS Token');
    console.log('\n-----------------');
    console.log(imsToken);

    console.log('\n-----------------');
    const prompt = 'Tell me a funny joke about firefall and firefly';
    console.log(`Prompt: ${prompt}`);
    const model = 'gpt-4';
    console.log(`Model: ${model}`);
    completion(imsToken, prompt, model, 0.1).then((json) => {
      const content = json.generations[0][0].message.content;
      console.log(`\nResponse from Firefall: \n\n${content}`);
      console.log('\n-----------------\n');
    });
  });

  ReactDOM.render(
    <RecoilRoot>
      <Provider theme={defaultTheme} width="100%" height="100%">
        <ApplicationProvider>
          <App />
        </ApplicationProvider>
      </Provider>,
    </RecoilRoot>,
    document.getElementById('root')
  );
});
