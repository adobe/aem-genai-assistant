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
export class ImsActions {
  imsLib = null;

  imsData = null;

  constructor(imsLib, imsData) {
    this.imsLib = imsLib;
    this.imsData = imsData;
  }

  // getProfile = () => {
  //   this.imsLib.getProfile().then((profile) => {
  //     this.imsData.adobeIdData.onProfile(profile);
  //   });
  // };

  getReleaseFlags = () => {
    this.imsLib.getReleaseFlags().then((flags) => {
      this.imsData.adobeIdData.flags = flags;
    })
      .catch((ex) => this.imsData.adobeIdData.onError(ex));
  };

  signIn = () => {
    this.imsLib.signIn();
  };

  signOut = () => {
    this.imsLib.signOut();
  };

  getFragmentValues = () => {
    return this.imsLib.fragmentValues();
  };

  getAccessToken = () => {
    const token = this.imsLib.getAccessToken();
    this.imsData.adobeIdData.onAccessToken(token);

    return token;
  };

  refreshToken = () => {
    this.imsLib.refreshToken();
  };

  isSignedInUser = () => {
    return this.imsLib.isSignedInUser();
  };

  reAuthenticateCheck = () => {
    this.imsLib.reAuthenticate();
  };

  reAuthenticateForce = () => {
    this.imsLib.reAuthenticate({}, 'force');
  };

  getProfile = () => {
    this.imsLib
      .getProfile()
      .then((profile) => {
        this.imsData.adobeIdData.onProfile(profile);
      })
      .catch((ex) => {
        this.imsData.adobeIdData.onError(ex);
      });
  };

  validateToken = () => {
    this.imsLib
      .validateToken()
      .then((isTokenvalid) => {
        this.imsData.onTokenValid(isTokenvalid);
      })
      .catch((ex) => {
        this.imsData.adobeIdData.onError(ex);
      });
  };

  listSocialProviders = () => {
    this.imsLib
      .listSocialProviders()
      .then((socialProviders) => {
        this.imsData.adobeIdData.onSocialProviders(socialProviders);
      })
      .catch((ex) => {
        this.imsData.adobeIdData.onError(ex);
      });
  };

  signInWithSocialProvider = () => {
    this.imsLib.signInWithSocialProvider('google');
  };

  avatarUrl = () => {
    return this.imsLib.avatarUrl;
  };

  /**
   * Method used to check if the user is signed in or not.
   * If not, it will trigger the auth flow.
   */
  async triggerAuthFlow() {
    console.log(`Signed in user: ${this.isSignedInUser()}`);
    if (!this.isSignedInUser()) {
      return this.signIn();
    }

    return null;
  }
}
