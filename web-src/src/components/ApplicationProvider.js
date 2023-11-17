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

import actions from '../config.json';

const APP_VERSION = process.env.REACT_APP_VERSION || 'unknown';

const COMPLETE_ACTION = 'complete';
const FEEDBACK_ACTION = 'feedback';

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
  const websiteUrl = getWebsiteUrlFromReferrer();
  console.log(`Website URL: ${websiteUrl}`);
  return {
    appVersion: APP_VERSION,
    websiteUrl,
    firefallService: new FirefallService({
      completeEndpoint: actions[COMPLETE_ACTION],
      feedbackEndpoint: actions[FEEDBACK_ACTION],
    }),
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
