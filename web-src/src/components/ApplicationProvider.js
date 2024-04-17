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
import { ExpressSdkService } from '../services/ExpressSdkService.js';
import actions from '../config.json';
import { useShellContext } from './ShellProvider.js';
import {
  customPromptTemplatesState,
  readCustomPromptTemplates,
} from '../state/PromptTemplatesState.js';
import { TargetService } from '../services/TargetService.js';
import { CsvParserService } from '../services/CsvParserService.js';
import { getFeatureFlags } from '../helpers/FeatureFlagsHelper.js';

const APP_VERSION = process.env.REACT_APP_VERSION || 'unknown';

const COMPLETE_ACTION = 'complete';
const FEEDBACK_ACTION = 'feedback';
const TARGET_ACTION = 'target';
const CSV_PARSER_ACTION = 'csv';

export const ApplicationContext = React.createContext(undefined);

export const ApplicationProvider = ({ children }) => {
  const { user, done } = useShellContext();
  const setCustomPromptTemplates = useSetRecoilState(customPromptTemplatesState);
  const [applicationContext, setApplicationContext] = useState(undefined);

  useEffect(() => {
    if (!user) {
      return;
    }

    console.debug('Reading custom prompt templates...');
    readCustomPromptTemplates().then((templates) => {
      setCustomPromptTemplates(templates);
    });

    const createApplicationContext = async () => {
      console.debug('Creating application context...');

      const featureFlags = await getFeatureFlags();
      console.debug('Feature flags:', featureFlags);

      return {
        appVersion: APP_VERSION,

        featureFlags,

        firefallService: new FirefallService({
          completeEndpoint: actions[COMPLETE_ACTION],
          feedbackEndpoint: actions[FEEDBACK_ACTION],
          imsOrg: user.imsOrg,
          accessToken: user.imsToken,
        }),

        csvParserService: new CsvParserService({
          csvParserEndpoint: actions[CSV_PARSER_ACTION],
        }),

        targetService: new TargetService({
          targetEndpoint: actions[TARGET_ACTION],
          imsTenant: user.imsTenant,
          accessToken: user.imsToken,
        }),

        expressSdkService: new ExpressSdkService({
          clientId: 'aem-genai-assistant',
          appName: 'AEM Generate Variations',
          userId: user.id,
          accessToken: user.imsToken,
        }),
      };
    };

    createApplicationContext().then((app) => {
      setApplicationContext(app);
      done();
    });
  }, [user, done, setApplicationContext]);

  if (!applicationContext) {
    return <Fragment />;
  }

  return (
    <ApplicationContext.Provider value={applicationContext}>
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
