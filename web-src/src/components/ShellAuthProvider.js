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

import React, { useEffect, createContext, useState, useContext } from 'react';
import { ToastQueue } from '@react-spectrum/toast';

import { useApplicationContext } from './ApplicationProvider';

export const ShellAuthContext = createContext({});

export const ShellAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isUserAuthorized, setIsUserAuthorized] = useState(false);
  const { config } = useApplicationContext();

  // Set userContext from config.imsProfile and config.imsToken and config.imsOrg
  useEffect(() => {
    setUser({
      imsProfile: config.imsProfile,
      imsToken: config.imsToken,
      imsOrg: config.imsOrg
    });
  }, [config]);

  // When the user changes, invoke isAuthorized function and display an error message in the UI if the user is not authorized
  // Otherwise, display the application
  useEffect(() => {
    if (user) {
      setIsUserAuthorized(isAuthorized(user));
      if (!isAuthorized(user)) {
        ToastQueue.negative('Oops it looks like you don\'t have access to this feature. Please ask you Administrator to give you access !', { timeout: 2000 });
      }

    }
  }, [user]);

  // Check if the user is authorized
  // The user is authorized if userInfo.imsProfile.projectedProductContext which is an array contains inside the array 
  // an object having the required product context and the owning entity matching the user.imsOrg
  const isAuthorized = (user) => {
    if (Array.isArray(user.imsProfile['projectedProductContext'])) {
      const filteredProductContext = user.imsProfile['projectedProductContext'].filter((obj) => obj['prodCtx']['serviceCode'] === process.env.IMS_PRODUCT_CONTEXT);

      // For each entry in filteredProductContext check that
      // there is at least one entry where user.imsOrg matches the owningEntity property 
      // otherwise, if no match, the user is not authorized
      return filteredProductContext.some((obj) => obj['prodCtx']['owningEntity'] === user.imsOrg);
    }
    return false;
  }

  return (
    <ShellAuthContext.Provider value={{ user, isUserAuthorized }}>
      <>{children}</>
    </ShellAuthContext.Provider>
  );
};

export const useShellAuthContext = () => {
  const context = useContext(ShellAuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext was used outside of its Provider');
  }
  return context;
};

export default ShellAuthProvider;
