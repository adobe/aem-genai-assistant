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
import ReactDOM from 'react-dom';

import {
  RecoilRoot,
} from 'recoil';

import { defaultTheme, Provider } from '@adobe/react-spectrum';
import { App } from './components/App';
import { ApplicationProvider } from './components/ApplicationProvider.js';
import { ShellAuthProvider } from './components/ShellAuthProvider.js';
import './index.css';
import excApp, { init } from '@adobe/exc-app';

init((config) => {

  const runtime = excApp();
  runtime.on('ready', ({imsOrg, imsToken, imsProfile, gainsight}) => {
    // const pair= gainsight.shellPath.split('?')[1];
    // window.referrer = pair.split('=')[1];
    
    console.log('Ready! received imsProfile:', imsProfile)
    
    const ims = {
      imsProfile: imsProfile,
      imsOrg: imsOrg,
      imsToken: imsToken
    }

    ReactDOM.render(
      <RecoilRoot>
        <Provider colorScheme="light" theme={defaultTheme} width="100%" height="100%">
          <ApplicationProvider>
            <ShellAuthProvider runtime={runtime} ims={ims}>
              <App />
            </ShellAuthProvider>
          </ApplicationProvider>
        </Provider>
      </RecoilRoot>,
      document.getElementById('root'),
    );
  });

  // ReactDOM.render(
  //   <RecoilRoot>
  //     <Provider colorScheme="light" theme={defaultTheme} width="100%" height="100%">
  //       <ApplicationProvider>
  //         <ShellAuthProvider runtime={runtime} ims={ims}>
  //           <App />
  //         </ShellAuthProvider>
  //       </ApplicationProvider>
  //     </Provider>
  //   </RecoilRoot>,
  //   document.getElementById('root'),
  // );
});
