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

import React, {
  useEffect, createContext, useState, useContext, useCallback, Fragment,
} from 'react';

import page from '@adobe/exc-app/page';

export const ShellContext = createContext();

const isAuthorized = (imsProfile, imsOrg) => {
  if (Array.isArray(imsProfile.projectedProductContext)) {
    const filteredProductContext = imsProfile.projectedProductContext
      .filter((obj) => obj.prodCtx.serviceCode === process.env.IMS_PRODUCT_CONTEXT);

    // For each entry in filteredProductContext check that
    // there is at least one entry where user.imsOrg matches the owningEntity property
    // otherwise, if no match, the user is not authorized
    return filteredProductContext.some((obj) => obj.prodCtx.owningEntity === imsOrg);
  }
  return false;
};

const expressAuthorized = (imsProfile, imsOrg) => {
  if (Array.isArray(imsProfile.projectedProductContext)) {
    const filteredProductContext = imsProfile.projectedProductContext
      .filter((obj) => obj.prodCtx.serviceCode === process.env.EXPRESS_PRODUCT_CONTEXT);

    // For each entry in filteredProductContext check that
    // there is at least one entry where user.imsOrg matches the owningEntity property
    // otherwise, if no match, the user is not authorized
    return filteredProductContext.some((obj) => obj.prodCtx.owningEntity === imsOrg);
  }
  return false;
};

export const ShellProvider = ({ children, runtime }) => {
  const [shellContext, setShellContext] = useState();

  const shellEventsHandler = useCallback((shellConfig) => {
    const {
      imsProfile, imsToken, imsOrg, imsInfo: { tenant }, locale,
    } = shellConfig;

    setShellContext({
      user: {
        id: imsProfile.userId,
        name: imsProfile.name,
        imsTenant: tenant,
        imsToken,
        imsOrg,
        locale,
      },
      isUserAuthorized: isAuthorized(imsProfile, imsOrg),
      isExpressAuthorized: expressAuthorized(imsProfile, imsOrg),
      done: page.done,
    });
  }, [setShellContext]);

  useEffect(() => {
    runtime.on('ready', shellEventsHandler);
    runtime.on('configuration', shellEventsHandler);
  }, []);

  if (!shellContext) {
    return <Fragment />;
  }

  return (
    <ShellContext.Provider value={shellContext}>
      {children}
    </ShellContext.Provider>
  );
};

export const useShellContext = () => {
  const context = useContext(ShellContext);
  if (context === undefined) {
    throw new Error('useAuthContext was used outside of its Provider');
  }
  return context;
};

export default ShellProvider;
