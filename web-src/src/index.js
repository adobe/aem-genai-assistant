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
} from 'recoil';

import {App} from './components/App'
import {defaultTheme, Provider} from '@adobe/react-spectrum';
import {ApplicationProvider} from './components/ApplicationProvider.js';
import './index.css'

import '@spectrum-css/vars/dist/spectrum-global.css';
import '@spectrum-css/vars/dist/spectrum-medium.css';
import '@spectrum-css/vars/dist/spectrum-light.css';
import '@spectrum-css/page/dist/index-vars.css';
import '@spectrum-css/button/dist/index-vars.css';
import '@spectrum-css/sidenav/dist/index-vars.css';

ReactDOM.render(
  <RecoilRoot>
    <Provider theme={defaultTheme} width="100%" height="100%">
      <ApplicationProvider>
        <App />
      </ApplicationProvider>
    </Provider>
  </RecoilRoot>,
  document.getElementById('root')
)
