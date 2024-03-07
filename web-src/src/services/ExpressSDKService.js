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
  constructor({
    clientId,
    appName,
    user,
  }) {
    this.clientId = clientId;
    this.appName = appName;
    this.user = user;
    this.userInfo = null;
    this.authInfo = null;
    this.ccEverywhereInstance = null;
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
            this.userInfo = {
              profile: {
                userId: this.user.imsProfile.userId,
                serviceCode: null,
                serviceLevel: null,
              },
              serviceCode: null,
              serviceLevel: null,
            };
            this.authInfo = {
              accessToken: this.user.imsToken,
              useJumpUrl: false,
              forceJumpCheck: false,
            };
            const ccEverywhere = await window.CCEverywhere.initialize(
              {
                clientId: this.clientId,
                appName: this.appName,
              },
              {},
              this.userInfo,
              this.authInfo,
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

    return loadExpressSDK(document, process.env.EXPRESS_SDK_URL);
  }

  async handleImageOperation(operation, operationParams) {
    if (this.ccEverywhereInstance == null) {
      await this.initExpressEditor()
        .then((ccEverywhereInstance) => {
          this.ccEverywhereInstance = ccEverywhereInstance;
        })
        .catch((error) => {
          console.error('Error:', error);
          return false;
        });
    }

    if (operation === 'generateImage') {
      this.ccEverywhereInstance.miniEditor.createImageFromText(operationParams, this.userInfo, this.authInfo);
    } else if (operation === 'editImage') {
      this.ccEverywhereInstance.miniEditor.editImage(operationParams, this.userInfo, this.authInfo);
    }
    return true;
  }
}
