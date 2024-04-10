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
import { AemService } from '../services/AemService.js';
import { contentFragmentModelState } from '../state/ContentFragmentModelState.js';
import { contentFragmentState } from '../state/ContentFragmentState.js';

const APP_VERSION = process.env.REACT_APP_VERSION || 'unknown';

const COMPLETE_ACTION = 'complete';
const FEEDBACK_ACTION = 'feedback';
const TARGET_ACTION = 'target';
const CSV_PARSER_ACTION = 'csv';
const CF_ACTION = 'cf';

function parseUrlParameters() {
  const searchParams = new URLSearchParams(window.location.search);
  return {
    aemHost: `https://${searchParams.get('aemHost')}`,
    fragmentId: searchParams.get('fragmentId'),
  };
}

export const ApplicationContext = React.createContext(undefined);

export const ApplicationProvider = ({ children }) => {
  const { user, done } = useShellContext();
  const setCustomPromptTemplates = useSetRecoilState(customPromptTemplatesState);
  const [application, setApplication] = useState(undefined);
  const setContentFragment = useSetRecoilState(contentFragmentState);
  const setContentFragmentModel = useSetRecoilState(contentFragmentModelState);

  useEffect(() => {
    if (!user) {
      return;
    }

    const {
      aemHost, fragmentId,
    } = parseUrlParameters();

    console.log(`AEM Host: ${aemHost}`);
    console.log(`Fragment ID: ${fragmentId}`);

    const aemService = new AemService({
      aemHost,
      cfEndpoint: actions[CF_ACTION],
      accessToken: user.imsToken,
    });

    aemService.getFragment(fragmentId).then((fragment) => {
      console.log(`Fragment: ${fragment}`);

      setContentFragment(fragment);

      aemService.getModel(fragment.model.id).then((model) => {
        console.log(`Model: ${model}`);

        setContentFragmentModel(model);

        setApplication({
          appVersion: APP_VERSION,

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
        });

        readCustomPromptTemplates().then((templates) => {
          setCustomPromptTemplates(templates);
        });

        done();
      }).catch((e) => {
        console.error(`Failed to get model: ${e.message}`);
      });
    }).catch((e) => {
      console.error(`Failed to get fragment: ${e.message}`);
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
