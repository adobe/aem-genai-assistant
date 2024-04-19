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

export const APP_VERSION = process.env.REACT_APP_VERSION || 'unknown';

export const RUN_MODE_DEFAULT = 'default';
export const RUN_MODE_CF = 'content-fragments';

const COMPLETE_ACTION = 'complete';
const FEEDBACK_ACTION = 'feedback';
const TARGET_ACTION = 'target';
const CSV_PARSER_ACTION = 'csv';
const CF_ACTION = 'cf';

export const ApplicationContext = React.createContext(undefined);

function parseUrlParameters() {
  const searchParams = new URLSearchParams(window.location.search);
  return {
    aemHost: `https://${searchParams.get('aemHost')}`,
    fragmentId: searchParams.get('fragmentId'),
  };
}

function createAemService(aemHost, accessToken) {
  return new AemService({
    aemHost,
    cfEndpoint: actions[CF_ACTION],
    accessToken,
  });
}

export const ApplicationProvider = ({ children }) => {
  const { user, done } = useShellContext();
  const setBundledPromptTemplates = useSetRecoilState(bundledPromptTemplatesState);
  const setCustomPromptTemplates = useSetRecoilState(customPromptTemplatesState);
  const setContentFragment = useSetRecoilState(contentFragmentState);
  const [application, setApplication] = useState(undefined);

  useEffect(() => {
    if (!user) {
      return;
    }

    const { aemHost, fragmentId } = parseUrlParameters();
    console.log(`AEM Host: ${aemHost}`);
    console.log(`Fragment ID: ${fragmentId}`);

    const runMode = fragmentId ? RUN_MODE_CF : RUN_MODE_DEFAULT;
    console.log(`Run Mode: ${runMode}`);

    const aemService = aemHost ? createAemService(aemHost, user.imsToken) : undefined;

    let startupPromise = Promise.resolve();

    if (aemService && fragmentId) {
      startupPromise = startupPromise.then(async () => {
        try {
          const fragment = await aemService.getFragment(fragmentId);
          console.debug(`Fragment: ${fragment}`);
          const model = await aemService.getFragmentModel(fragment.model.id);
          setContentFragment({
            fragment,
            model,
          });
        } catch (e) {
          throw new Error(`Failed to get fragment: ${e.message}`);
        }
      });
    }

    setBundledPromptTemplates(parseBundledPromptTemplates(runMode));
    readCustomPromptTemplates(runMode, RUN_MODE_DEFAULT).then((templates) => {
      setCustomPromptTemplates(templates);
    });

    startupPromise.then(() => {
      setApplication({
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

        aemService,
      });

      done();
    }).catch((e) => {
      console.error(`Failed to initialize application: ${e.message}`);
    });
  }, [user, done, setApplication]);

  if (!application) {
    return <Fragment/>;
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
