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
export class ExpressSDKService {
  CDN_URL = 'https://sdk-1p.cc-embed.adobe.com/v3/CCEverywhere.js';
  //'https://sdk.cc-embed.adobe.com/v3/CCEverywhere.js';

  constructor({
    clientId,
    appName,
    user, // ShellProvider user
  }) {
    this.clientId = clientId;
    this.appName = appName;
    this.user = user;
  }

  async initExpressEditor() {
    const loadExpressSDK = (document, url) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = async () => {
          if (!window.CCEverywhere) {
            reject(new Error('CCEverywhere SDK not found'));
            return;
          }
          try {
            // https://docs.cc-embed.adobe.com/v3/release/1p/interfaces/shared_src_types_Authentication_types.UserProfile.html
            const userInfo = {
              profile: {
                userId: this.user.imsProfile.userId,
                serviceCode: null,
                serviceLevel: null,
              },
              serviceCode: null,
              serviceLevel: null,
            }
            const authInfo = {
              accessToken: this.user.imsToken,
              useJumpUrl: false,
              forceJumpCheck: false,
            }
            const ccEverywhere = await window.CCEverywhere.initialize({
              clientId: this.clientId,
              appName: this.appName,
            },
              {}, //config
              userInfo,
              authInfo
            );
            resolve(ccEverywhere);
          } catch (error) {
            reject(error);
          }
        };
        script.onerror = () => reject(new Error('Failed to load CCEverywhere SDK'));
        document.body.appendChild(script);
      });
    };

    return loadExpressSDK(document, this.CDN_URL);
  }
}
