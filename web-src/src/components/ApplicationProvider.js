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
import React, { useContext } from 'react';
import { Content, Heading, InlineAlert } from '@adobe/react-spectrum';
import { FirefallService } from '../services/FirefallService.js';
import { ImsAuthClient } from '../ims/ImsAuthClient.js';

const APP_VERSION = process.env.REACT_APP_VERSION || 'unknown';
console.log(`Version: ${APP_VERSION}`);

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
console.log(`API_ENDPOINT: ${API_ENDPOINT}`);

function getWebsiteUrl() {
  const searchParams = new URLSearchParams(window.location.search);
  const ref = searchParams.get('ref');
  const repo = searchParams.get('repo');
  const owner = searchParams.get('owner');
  if (!ref || !repo || !owner) {
    throw Error('It seems we\'re missing the ref, repo or owner search parameter in your application.');
  }
  return `https://${ref}--${repo}--${owner}.hlx.page`;
}

function createApplication() {
  const websiteUrl = getWebsiteUrl();
  console.log(`Website URL: ${websiteUrl}`);
  return {
    appVersion: APP_VERSION,
    websiteUrl,
    firefallService: new FirefallService(API_ENDPOINT),
    imsAuthClient: new ImsAuthClient(),
  };
}

export const ApplicationContext = React.createContext(undefined);

export const ApplicationProvider = ({ children }) => {
  try {
    const application = createApplication();
    return (
      <ApplicationContext.Provider value={application}>
        {children}
      </ApplicationContext.Provider>
    );
  } catch (e) {
    return (
      <InlineAlert margin={'50px'}>
        <Heading>Oops! It looks like we ran into a small snag</Heading>
        <Content>{e.message}</Content>
      </InlineAlert>
    );
  }
};

export const useApplicationContext = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplicationContext was used outside of its Provider');
  }
  return context;
};
