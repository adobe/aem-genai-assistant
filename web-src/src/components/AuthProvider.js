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

import { useApplicationContext } from './ApplicationProvider.js';
import { BusyDialog } from './BusyDialog.js';

export const AuthContext = React.createContext({});

export const AuthProvider = ({ children }) => {
  const { imsAuthClient } = useApplicationContext();

  const [imsToken, setImsToken] = useState(null);
  const [inProgress, setInProgress] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [error, setError] = useState(undefined);

  const onSignOut = () => {
    console.log('Signing out');
    imsAuthClient.imsActions.signOut();
    setAccessGranted(false);
  };

  // Trigger the auth flow and get the IMS token
  useEffect(() => {
    const init = async () => {
      console.log('Trigger Auth Flow');
      await imsAuthClient.imsActions.triggerAuthFlow();
      return imsAuthClient.imsActions.getAccessToken()?.token;
    };
    init().then((token) => {
      setImsToken(token);
      setInProgress(false);
      setAccessGranted(true);
      imsAuthClient.imsActions.getProfile();
    });
  }, []);

  return (
    <AuthContext.Provider value={{ imsToken, onSignOut }}>
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
