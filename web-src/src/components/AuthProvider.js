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

import React, { useEffect, useState, useContext } from 'react';

import { getImsAuthService } from '../components/ImsAuthService';
import { BusyDialog } from './BusyDialog';

export const AuthContext = React.createContext({});

export const AuthProvider = ({ children }) => {
  const initImsAuthInfo = {
    env: process.env.IMS_ENV,
    imsClientId: process.env.IMS_CLIENT_ID,
    imsScope: 'AdobeID,openid,read_organizations,additional_info.projectedProductContext,additional_info.roles',
    redirectUrl: window.location.href,
    modalMode: false,
    imsAuthService: undefined,
    useLocalStorage: true,
    onAccessTokenReceived: () => {
      console.log('onAccessTokenReceived');
      if (window.assistantAuthService?.isSignedInUser()) {
        setIsSignedInUser(true);
      }
    }
  };

  const [imsAuthInfo, setImsAuthInfo] = useState(initImsAuthInfo);
  const [isSignedInUser, setIsSignedInUser] = useState(false);
  const [imsToken, setImsToken] = useState(null);
  const [inProgress, setInProgress] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [error, setError] = useState(undefined);

  const onSignOut = () => {
    console.log('Signing out');
    const tokenService = window.assistantAuthService;
    tokenService.signOut();
    setAccessGranted(false);
  };

  // you must register the token service before using the assistant
  useEffect(() => {
    // you can also access the tokenService from window.assistantAuthService
    console.log('Initializing IMS Auth Service');
    const tokenService = getImsAuthService(imsAuthInfo);
    tokenService.getAdobeIms().enableLogging();
    
    setImsAuthInfo((prevInfo) => {
      return {
        ...prevInfo,
        imsAuthService: tokenService,
      };
    });
  }, []);

  // Trigger the auth flow and get the IMS token
  // This is usually the path when a page is reloaded from a re-direct SUSI flow
  useEffect(() => {
    const init = async () => {
      console.log('Trigger Auth Flow');
      await window.assistantAuthService?.initialize?.();
      await window.assistantAuthService?.triggerAuthFlow?.();
      return window.assistantAuthService?.getImsToken?.();
    };
    init().then((token) => {
      // Workaround - on first login, imsToken does not get added to the imsAuthService
      // Setting the imsToken directly on the imsAuthService to avoid undefined imsToken even though it exists
      // imsAuthInfo.imsAuthService.setImsToken?.(token);
      window.assistantAuthService?.setImsToken?.(token);
      setImsToken(token);

      // setInProgress(false);
      setAccessGranted(true);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ imsAuthInfo, imsToken, isSignedInUser, onSignOut }}>
      {accessGranted ? <>{children}</> : <BusyDialog inProgress={inProgress} error={error} />}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext was used outside of its Provider');
  }
  return context;
};

export default AuthProvider;
