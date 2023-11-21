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

function getPromptTemplatesPath() {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('prompts') || PROMPT_TEMPLATES_FILENAME;
}

function getConfiguration() {
  return {
    appVersion: APP_VERSION,
    websiteUrl: getWebsiteUrl(),
    promptTemplatesPath: getPromptTemplatesPath(),
  };
}

function createApplication(configuration, shellConfig) {
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
  const setConfiguration = useSetRecoilState(configurationState);
  const [application, setApplication] = useState(undefined);
  const [error, setError] = React.useState(undefined);

  const shellEventsHandler = useCallback((config) => {
    try {
      const appConfig = getConfiguration();
      setConfiguration(appConfig);
      setApplication(() => createApplication(appConfig, config));
      console.log(config);
    } catch (e) {
      console.error(e, 'Failed to create application');
      setError(e);
    }
  }, [setConfiguration, setError]);

  useEffect(() => {
    const runtime = excApp();
    runtime.on('ready', shellEventsHandler);
    runtime.on('configuration', shellEventsHandler);
  }, []);

  page.done();

  if (error) {
    return (
      <InlineAlert margin={'50px'}>
        <Heading>Oops! It looks like we ran into a small snag</Heading>
        <Content>{error.message}</Content>
      </InlineAlert>
    );
  } else if (application) {
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
