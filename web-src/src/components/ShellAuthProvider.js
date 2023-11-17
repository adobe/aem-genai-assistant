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

  // set userContext from config.imsProfile and config.imsToken and config.imsOrg
  useEffect(() => {
    setUser({
      imsProfile: config.imsProfile,
      imsToken: config.imsToken,
      imsOrg: config.imsOrg
    });
  }, [config]);

  // when the user changes, invoke isAuthorized function and display an error message in the UI if the user is not authorized
  // otherwise display the application
  useEffect(() => {
    if (user) {
      setIsUserAuthorized(isAuthorized(user));
      if (!isAuthorized(user)) {
        ToastQueue.negative('Oops it looks like you don\'t have access to this feature. Please ask you Administrator to give you access !', { timeout: 2000 });
      }

    }
  }, [user]);


  // check if the user is authorized
  // the user is authorized if userInfo.imsProfile.projectedProductContext which is an array
  // containes inside the array an object having the property "context" as "dma_aem_cloud"
  const isAuthorized = (user) => {
    let userProfile = user.imsProfile;
    if (Array.isArray(userProfile['projectedProductContext'])) {
      const filteredProductContext = userProfile['projectedProductContext'].filter((obj) => obj['prodCtx']['serviceCode'] === "dma_aem_cloud");

      // for each entry in filteredProductContext check  that
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

export const useAuthContext = () => {
  const context = useContext(ShellAuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext was used outside of its Provider');
  }
  return context;
};

export default ShellAuthProvider;
