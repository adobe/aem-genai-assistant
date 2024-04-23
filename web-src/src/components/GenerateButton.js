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
import { sampleRUM } from '../rum.js';

export function GenerateButton() {
  const { firefallService } = useApplicationContext();

  const prompt = useRecoilValue(promptState);
  const parameters = useRecoilValue(parametersState);
  const temperature = useRecoilValue(temperatureState);

  const setResults = useSetRecoilState(resultsState);
  const setIsOpenPromptEditor = useSetRecoilState(promptEditorState);
  const [generationInProgress, setGenerationInProgress] = useState(false);

  const saveResults = useSaveResults();
  const { formatMessage } = useIntl();

  const generateResults = useCallback(async () => {
    try {
      const finalPrompt = renderPrompt(prompt, parameters);
      const { queryId, response } = await firefallService.complete(finalPrompt, temperature, true);
      const variants = createVariants(uuid, response);
      setResults((results) => [...results, {
        id: queryId,
        variants,
        prompt: finalPrompt,
        promptTemplate: prompt,
        parameters,
        temperature,
      }]);
      await saveResults();
      log('prompt:generate:variations:generated', { variations: variants.length, queryId });
      sampleRUM('genai:prompt:generatedvariations', { source: 'GenerateButton#generateResults', target: variants.length });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, [firefallService, prompt, parameters, temperature]);

  const handleGenerate = useCallback(() => {
    log('prompt:generate');
    sampleRUM('genai:prompt:generate', { source: 'GenerateButton#handleGenerate' });
    setGenerationInProgress(true);
    setIsOpenPromptEditor(false);
    generateResults()
      .catch((error) => {
        ToastQueue.negative(error.message, { timeout: 2000 });
      })
      .finally(() => {
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
        isDisabled={generationInProgress}>
        {generationInProgress ? <ProgressCircle size="S" aria-label="Generate" isIndeterminate right="8px" /> : <GenAIIcon marginEnd={'8px'} />}
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
