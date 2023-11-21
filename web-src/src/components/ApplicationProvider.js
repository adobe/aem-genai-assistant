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
import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Content, Heading, InlineAlert } from '@adobe/react-spectrum';
import { useSetRecoilState } from 'recoil';
import excApp from '@adobe/exc-app';
import page from '@adobe/exc-app/page';

import { FirefallService } from '../services/FirefallService.js';
import actions from '../config.json';
import { configurationState } from '../state/ConfigurationState.js';

const APP_VERSION = process.env.REACT_APP_VERSION || 'unknown';

const COMPLETE_ACTION = 'complete';
const FEEDBACK_ACTION = 'feedback';

const PROMPT_TEMPLATES_FILENAME = 'prompttemplates';

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

function createApplication(shellConfig) {
  const websiteUrl = getWebsiteUrl();
  console.log(`Website URL: ${websiteUrl}`);
  return {
    appVersion: APP_VERSION,
    websiteUrl: getWebsiteUrl(),
    promptTemplatesPath: getPromptTemplatesPath(),
  };
}

function createApplication(configuration) {
  return {
    ...configuration,
    firefallService: new FirefallService({
      completeEndpoint: actions[COMPLETE_ACTION],
      feedbackEndpoint: actions[FEEDBACK_ACTION],
    }),
    shellConfig: shellConfig
  };
}

export const ApplicationContext = React.createContext(undefined);

export const ApplicationProvider = ({ children }) => {
  const [application, setApplication] = useState(undefined);

  const shellEventsHandler = useCallback((config) => {
    setApplication(() => createApplication(config));
    console.log(config);
  }, []);

  useEffect(() => {
    const runtime = excApp();
    runtime.on('ready', shellEventsHandler);
    runtime.on('configuration', shellEventsHandler);
  }, []);

  if (!application) {
    return (<Fragment />);
  }

  page.done();

  try {
    return (
      <ApplicationContext.Provider value={application}>
        {children}
      </ApplicationContext.Provider>
    );
  }

  return (<Fragment/>);
};

export const useApplicationContext = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplicationContext was used outside of its Provider');
  }
  return context;
};
