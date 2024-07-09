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
import {
  Button, Content, ContextualHelp, Flex, Heading, ProgressCircle,
} from '@adobe/react-spectrum';
import React, { useCallback, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { ToastQueue } from '@react-spectrum/toast';
import { v4 as uuid } from 'uuid';
import { useIntl } from 'react-intl';

import { intlMessages } from './PromptSessionSideView.l10n.js';
import GenAIIcon from '../icons/GenAIIcon.js';
import { renderPrompt } from '../helpers/PromptRenderer.js';
import { useApplicationContext } from './ApplicationProvider.js';
import { promptState } from '../state/PromptState.js';
import { temperatureState } from '../state/TemperatureState.js';
import { resultsState } from '../state/ResultsState.js';
import { parametersState } from '../state/ParametersState.js';
import { promptEditorState } from '../state/PromptEditorState.js';
import { LegalTermsLink } from './LegalTermsLink.js';
import { useSaveResults } from '../state/SaveResultsHook.js';
import { createVariants } from '../helpers/ResultsParser.js';
import { log } from '../helpers/MetricsHelper.js';
import { contentFragmentState } from '../state/ContentFragmentState.js';
import { RUN_MODE_CF } from '../state/RunMode.js';
import { FIREFALL_ACTION_TYPES } from '../services/FirefallService.js';

const createWaitMessagesController = (intlFn) => {
  const displayToast = (msg, timeout = 1500) => {
    ToastQueue.info(msg, { timeout });
  };

  const closeToast = () => {
    // Closing an active toast, if any
    const toast = document.querySelector('div[class*="spectrum-Toast-buttons"]');
    if (toast !== null) {
      const closeBtn = toast.querySelector('button[aria-label="Close"]');
      if (closeBtn !== null) {
        closeBtn.click();
      }
    }
  };

  const waitMessages = [
    { msg: intlMessages.promptSessionSideView.variationsGeneration15SecondsWaitTimeToast, delay: 15 },
    { msg: intlMessages.promptSessionSideView.variationsGeneration30SecondsWaitTimeToast, delay: 30 },
    { msg: intlMessages.promptSessionSideView.variationsGeneration45SecondsWaitTimeToast, delay: 45 },
    { msg: intlMessages.promptSessionSideView.variationsGeneration60SecondsWaitTimeToast, delay: 60 },
    { msg: intlMessages.promptSessionSideView.variationsGeneration75SecondsWaitTimeToast, delay: 75 },
    { msg: intlMessages.promptSessionSideView.variationsGeneration90SecondsWaitTimeToast, delay: 90 },
    { msg: intlMessages.promptSessionSideView.variationsGeneration105SecondsWaitTimeToast, delay: 105 },
    { msg: intlMessages.promptSessionSideView.variationsGeneration120SecondsWaitTimeToast, delay: 120 },
    { msg: intlMessages.promptSessionSideView.variationsGenerationLongWaitTimeToast, delay: 180 },
    { msg: intlMessages.promptSessionSideView.variationsGenerationLongWaitTimeToast, delay: 240 },
  ];
  const timeoutIds = [];
  return {
    startDisplaying: () => {
      for (const waitMessage of waitMessages) {
        timeoutIds.push(
          setTimeout(() => {
            closeToast();
            displayToast(intlFn(waitMessage.msg));
          }, waitMessage.delay * 1000),
        );
      }
    },
    stopDisplaying: () => {
      if (timeoutIds.length > 0) {
        while (timeoutIds.length > 0) {
          clearTimeout(timeoutIds.shift());
        }
        closeToast();
      }
    },
  };
};

export function GenerateButton({ isDisabled }) {
  const { runMode, firefallService } = useApplicationContext();
  const prompt = useRecoilValue(promptState);
  const parameters = useRecoilValue(parametersState);
  const contentFragment = useRecoilValue(contentFragmentState);
  const temperature = useRecoilValue(temperatureState);

  const setResults = useSetRecoilState(resultsState);
  const setIsOpenPromptEditor = useSetRecoilState(promptEditorState);
  const [generationInProgress, setGenerationInProgress] = useState(false);

  const saveResults = useSaveResults();
  const { formatMessage } = useIntl();

  const generateResults = useCallback(async () => {
    try {
      const finalPrompt = renderPrompt(prompt, parameters, contentFragment?.model, contentFragment?.fragment);
      const { queryId, response } = await firefallService.complete(
        finalPrompt,
        temperature,
        FIREFALL_ACTION_TYPES.VARIATIONS_GENERATION,
      );
      const variants = createVariants(uuid, response);
      setResults((results) => [...results, {
        id: queryId,
        variants,
        prompt: finalPrompt,
        promptTemplate: prompt,
        parameters,
        temperature,
      }]);
      if (runMode !== RUN_MODE_CF) {
        await saveResults();
      }
      log('prompt:generate:variations:generated', { source: 'GenerateButton#generateResults', variations: variants.length, queryId });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, [firefallService, prompt, parameters, temperature]);

  const handleGenerate = useCallback(() => {
    log('prompt:generate', { source: 'GenerateButton#handleGenerate' });
    setGenerationInProgress(true);
    setIsOpenPromptEditor(false);

    const waitMessagesController = createWaitMessagesController(formatMessage);
    waitMessagesController.startDisplaying();

    generateResults()
      .catch((error) => {
        waitMessagesController.stopDisplaying();
        ToastQueue.negative(error.message, { timeout: 2000 });
      })
      .finally(() => {
        waitMessagesController.stopDisplaying();
        setGenerationInProgress(false);
      });
  }, [generateResults, setGenerationInProgress]);

  return (
    <Flex direction="row" gap="size-100" alignItems={'center'}>
      <Button
        UNSAFE_className="hover-cursor-pointer"
        width="size-1700"
        variant="cta"
        style="fill"
        onPress={handleGenerate}
        isDisabled={isDisabled || generationInProgress}>
        {generationInProgress ? <ProgressCircle size="S" aria-label="Generate" isIndeterminate right="8px" /> : <GenAIIcon marginEnd={'8px'} color={'white'}/>}
        {formatMessage(intlMessages.promptSessionSideView.generateButtonLabel)}
      </Button>
      <ContextualHelp variant="info">
        <Heading>{formatMessage(intlMessages.promptSessionSideView.generateButtonContextualInfoHeading)}</Heading>
        <Content>
          {formatMessage(intlMessages.promptSessionSideView.generateButtonContextualInfoContent, {
            p: (chunks) => <p>{chunks}</p>,
            ul: (chunks) => <ul>{chunks}</ul>,
            li: (chunks) => <li>{chunks}</li>,
            legalTermsLink: <LegalTermsLink />,
          })}
        </Content>
      </ContextualHelp>
    </Flex>
  );
}
