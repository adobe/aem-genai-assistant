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
  Fragment, useContext, useEffect, useState,
} from 'react';
import { useSetRecoilState } from 'recoil';
import { FirefallService } from '../services/FirefallService.js';
import { ExpressSDKService } from '../services/ExpressSDKService.js';
import actions from '../config.json';
import { useShellContext } from './ShellProvider.js';
import { loadPromptTemplates, promptTemplatesState } from '../state/PromptTemplatesState.js';

const APP_VERSION = process.env.REACT_APP_VERSION || 'unknown';

const COMPLETE_ACTION = 'complete';
const FEEDBACK_ACTION = 'feedback';

const PROMPTS_TEMPLATES_PARAM_NAME = 'prompts';

const PROMPT_TEMPLATES_FILENAME = 'prompt-templates';

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
  return searchParams.get(PROMPTS_TEMPLATES_PARAM_NAME) || PROMPT_TEMPLATES_FILENAME;
}

export const ApplicationContext = React.createContext(undefined);

export const ApplicationProvider = ({ children }) => {
  const { user, done } = useShellContext();
  const setPromptTemplates = useSetRecoilState(promptTemplatesState);
  const [application, setApplication] = useState(undefined);

  useEffect(() => {
    if (!user) {
      return;
    }

    const websiteUrl = getWebsiteUrl();
    const promptTemplatesPath = getPromptTemplatesPath();
    const expressSDKService = new ExpressSDKService({
      // TODO: replace with our own client ID
      clientId: 'aem-genai-assistant',
      appName: 'Partner Days Embed SDK Demo',
      user: user
    });

    setApplication({
      appVersion: APP_VERSION,
      websiteUrl,
      promptTemplatesPath,
      firefallService: new FirefallService({
        completeEndpoint: actions[COMPLETE_ACTION],
        feedbackEndpoint: actions[FEEDBACK_ACTION],
        imsOrg: user.imsOrg,
        accessToken: user.imsToken,
      }),
      expressSDKService,
    });

    loadPromptTemplates(websiteUrl, promptTemplatesPath).then((templates) => {
      setPromptTemplates(templates);
    }).catch((e) => {
      console.error(`Failed to load prompt templates: ${e.message}`);
    });

    done();
  }, [user, done, setApplication]);

  if (!application) {
    return <Fragment />;
  }

  return (
    <ApplicationContext.Provider value={application}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplicationContext = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplicationContext was used outside of its Provider');
  }
  return context;
};
