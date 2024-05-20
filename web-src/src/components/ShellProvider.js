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
import { AccessProfileService } from '../services/AccessProfileService.js';
import { FeatureFlagsService } from '../services/FeatureFlagsService.js';

export const ShellContext = createContext();

const FEATURE_FLAGS_PROJECT_ID = 'aem-generate-variations';

const userAuthorized = (accessProfile, imsOrg) => {
  if (Array.isArray(accessProfile.appProfile?.accessibleItems)) {
    const filteredItems = accessProfile.appProfile.accessibleItems
      .filter((obj) => obj.fulfillable_items[process.env.PRODUCT_ENTITLEMENT]?.enabled);

    // For each entry in filteredItems check that
    // there is at least one entry where user.imsOrg matches the owner_id property
    // otherwise, if no match, the user is not authorized to use the product
    return filteredItems.some((obj) => obj.source.owner_id === imsOrg);
  }
  return false;
};

const expressAuthorized = (accessProfile, imsOrg) => {
  if (Array.isArray(accessProfile.appProfile?.accessibleItems)) {
    const filteredItems = accessProfile.appProfile.accessibleItems
      .filter((obj) => obj.fulfillable_items[process.env.EXPRESS_ENTITLEMENT]?.enabled);

    // For each entry in filteredItems check that
    // there is at least one entry where user.imsOrg matches the owner_id property
    // otherwise, if no match, the user is not authorized to use Express
    return filteredItems.some((obj) => obj.source.owner_id === imsOrg);
  }
  return false;
};

export const ShellProvider = ({ children, runtime }) => {
  const [shellContext, setShellContext] = useState();

  const shellEventsHandler = useCallback((shellConfig) => {
    const {
      imsProfile, imsToken, imsOrg, imsInfo: { tenant }, locale, internal,
    } = shellConfig;

    setShellContext({
      user: {
        id: imsProfile.userId,
        name: imsProfile.name,
        imsTenant: tenant,
        imsToken,
        imsOrg,
        locale,
        internal,
      },
      done: page.done,
    });
  }, []);

  useEffect(() => {
    runtime.on('ready', shellEventsHandler);
    runtime.on('configuration', shellEventsHandler);
  }, []);

  useEffect(() => {
    FeatureFlagsService.create(FEATURE_FLAGS_PROJECT_ID)
      .then((featureFlagsService) => {
        setShellContext((prevContext) => ({
          ...prevContext,
          featureFlagsService,
        }));
      })
      .catch((error) => {
        console.error('Failed to initialize feature flags service:', error);
      });
  }, []);

  useEffect(() => {
    const accessProfileService = AccessProfileService.create(shellContext?.user.imsToken);

    accessProfileService?.getAccessProfile()
    // AccessProfileService.getMockAccessProfile()
      .then((accessProfile) => {
        setShellContext((prevContext) => ({
          ...prevContext,
          isUserAuthorized: userAuthorized(accessProfile, shellContext?.user.imsOrg),
          isExpressAuthorized: expressAuthorized(accessProfile, shellContext?.user.imsOrg),
        }));
      })
      .catch((error) => {
        console.error('Failed to initialize access profile service:', error);
      });
  }, [shellContext?.user]);

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
