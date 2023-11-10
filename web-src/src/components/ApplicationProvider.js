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
import { CompletionService } from '../services/CompletionService.js';

const APP_VERSION = process.env.REACT_APP_VERSION || 'unknown';
console.log(`Version: ${APP_VERSION}`);

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
console.log(`API_ENDPOINT: ${API_ENDPOINT}`);

// https://experience.adobe.com/?devMode=true#/custom-apps/?localDevUrl=https://localhost:9080/?referrer=https://genai--express-website--vtsaplin.hlx.page/express/create/flyer

function getWebsiteUrlFromReferrer() {
  /* eslint-disable-next-line no-undef */
  const searchParams = new URLSearchParams(window.location.search);
  if (!searchParams.has('referrer')) {
    throw Error('It seems we\'re missing the referrer search parameter in your application.');
  }
  const referrer = searchParams.get('referrer');
  const url = new URL(referrer ?? window.referrer);
  return `${url.protocol}//${url.host}`;
}

function createApplication() {
  return {
    appVersion: APP_VERSION,
    websiteUrl: getWebsiteUrlFromReferrer(),
    completionService: new CompletionService(API_ENDPOINT),
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
      <div style={{ padding: '10px', margin: '50px' }}>
        <h2>Oops! It looks like we ran into a small snag.</h2>
        <p>{e.message}</p>
      </div>
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
