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
export class ImsData {
  imslibData = {
    token: null,
    tokenValid: false,
    isSignedInUser: false,
    reauthToken: null,
    tokenHasExpired: false,
    ready: false,
    error: null,
    profile: null,
    appState: null,
  };

  onStateChanged = null;

  triggerOnStateChanged(newState) {
    this.imslibData = { ...newState };

    this.onStateChanged(newState);
  }

  constructor(onStateChanged, adobeid = null) {
    this.onStateChanged = onStateChanged;
    if (adobeid) {
      this.adobeIdData = {
        ...this.adobeIdData,
        ...adobeid,
      };
    }
  }

  adobeIdData = {
    client_id: process.env.IMS_CLIENT_ID,
    scope: 'AdobeID,openid,read_organizations,additional_info.projectedProductContext,additional_info.roles',
    locale: 'en_US',
    environment: process.env.IMS_ENV,
    modalMode: false,
    onAccessToken: (token) => {
      const imslibData = {
        ...this.imslibData,
        token,
        isSignedInUser: true,
      };
      this.triggerOnStateChanged(imslibData);
    },
    onAccessTokenHasExpired: () => {
      const imslibData = {
        ...this.imslibData,
        tokenHasExpired: true,
      };
      this.triggerOnStateChanged(imslibData);
    },
    onReauthAccessToken: (reauthToken) => {
      const imslibData = {
        ...this.imslibData,
        reauthToken,
        isSignedInUser: true,
      };
      this.triggerOnStateChanged(imslibData);
    },
    onError: (errortype, error) => {
      const imslibData = {
        ...this.imslibData,
        error: {
          errortype,
          error,
        },
        isSignedInUser: true,
      };
      this.triggerOnStateChanged(imslibData);
    },
    onReady: (context) => {
      const imslibData = {
        ...this.imslibData,
        ready: true,
        appState: context,
      };
      this.triggerOnStateChanged(imslibData);
    },
    onProfile: (profile) => {
      const imslibData = {
        ...this.imslibData,
        profile,
      };
      this.triggerOnStateChanged(imslibData);
    },
  };

  onTokenValid = (valid) => {
    const imslibData = {
      ...this.imslibData,
      tokenValid: valid,
      isSignedInUser: true,
    };
    this.triggerOnStateChanged(imslibData);
  };
}
