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
  bundledPromptTemplatesState,
  customPromptTemplatesState, parseBundledPromptTemplates, readCustomPromptTemplates,
} from '../state/PromptTemplatesState.js';
import { TargetService } from '../services/TargetService.js';
import { CsvParserService } from '../services/CsvParserService.js';
import { AemService } from '../services/AemService.js';
import { contentFragmentState } from '../state/ContentFragmentState.js';
import { ContentScrappingService } from '../services/ContentScrapingService.js';
import { RUN_MODE_CF, RUN_MODE_DEFAULT } from '../state/RunMode.js';

export const APP_VERSION = process.env.REACT_APP_VERSION || 'unknown';

const COMPLETE_ACTION = 'complete';
const FEEDBACK_ACTION = 'feedback';
const TARGET_ACTION = 'target';
const CSV_PARSER_ACTION = 'csv';
const CF_ACTION = 'cf';
const SCRAPER_ACTION = 'scraper';

export const ApplicationContext = React.createContext(undefined);

export function parseUrlParameters() {
  const searchParams = new URLSearchParams(window.location.search);
  return {
    aemHost: `https://${searchParams.get('aemHost')}`,
    fragmentId: searchParams.get('fragmentId'),
  };
}

function createAemService(aemHost, imsOrg, accessToken) {
  return new AemService({
    aemHost,
    cfEndpoint: actions[CF_ACTION],
    imsOrg,
    accessToken,
  });
}

export const ApplicationProvider = ({ children }) => {
  const { user, done } = useShellContext();
  const setBundledPromptTemplates = useSetRecoilState(bundledPromptTemplatesState);
  const setCustomPromptTemplates = useSetRecoilState(customPromptTemplatesState);
  const setContentFragment = useSetRecoilState(contentFragmentState);
  const [applicationContext, setApplicationContext] = useState(undefined);

  useEffect(() => {
    if (!user) {
      return;
    }

    const createApplicationContext = async () => {
      console.debug('Creating application context...');

      const { aemHost, fragmentId } = parseUrlParameters();
      console.log(`AEM Host: ${aemHost}`);
      console.log(`Fragment ID: ${fragmentId}`);

      const runMode = fragmentId ? RUN_MODE_CF : RUN_MODE_DEFAULT;
      console.log(`Run Mode: ${runMode}`);

      console.debug('Reading bundled prompt templates...');
      setBundledPromptTemplates(parseBundledPromptTemplates(runMode));

      console.debug('Reading custom prompt templates...');
      readCustomPromptTemplates(runMode).then((templates) => {
        setCustomPromptTemplates(templates);
      });

      const aemService = aemHost ? createAemService(aemHost, user.imsOrg, user.imsToken) : undefined;

      if (aemService && fragmentId) {
        try {
          const fragment = await aemService.getFragment(fragmentId);
          const model = await aemService.getFragmentModel(fragment.model.id);
          setContentFragment({
            fragment,
            model,
          });
        } catch (e) {
          throw new Error(`Failed to get fragment: ${e.message}`);
        }
      }

      return {
        appVersion: APP_VERSION,

        runMode,

        firefallService: new FirefallService({
          completeEndpoint: actions[COMPLETE_ACTION],
          feedbackEndpoint: actions[FEEDBACK_ACTION],
          imsOrg: user.imsOrg,
          accessToken: user.imsToken,
        }),

        csvParserService: new CsvParserService({
          csvParserEndpoint: actions[CSV_PARSER_ACTION],
          imsOrg: user.imsOrg,
          accessToken: user.imsToken,
        }),

        targetService: new TargetService({
          targetEndpoint: actions[TARGET_ACTION],
          imsTenant: user.imsTenant,
          imsOrg: user.imsOrg,
          accessToken: user.imsToken,
        }),

        contentScrapingService: new ContentScrappingService({
          scraperEndpoint: actions[SCRAPER_ACTION],
          imsOrg: user.imsOrg,
          accessToken: user.imsToken,
        }),

        expressSdkService: new ExpressSdkService({
          clientId: 'aem-genai-assistant',
          appName: 'AEM Generate Variations',
          userId: user.id,
          locale: user.locale,
        }),

        aemService,
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
