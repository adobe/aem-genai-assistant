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
import GenAIIcon from '../icons/GenAIIcon.js';
import { renderPrompt } from '../helpers/PromptRenderer.js';
import { useApplicationContext } from './ApplicationProvider.js';
import { promptState } from '../state/PromptState.js';
import { temperatureState } from '../state/TemperatureState.js';
import { resultsState } from '../state/ResultsState.js';
import { parametersState } from '../state/ParametersState.js';
import { LegalTermsLink } from './LegalTermsLink.js';
import { useSaveResults } from '../state/SaveResultsHook.js';
import { createVariants } from '../helpers/ResultsParser.js';
import { sampleRUM } from '../rum.js';

export function GenerateButton() {
  const { firefallService } = useApplicationContext();
  const prompt = useRecoilValue(promptState);
  const parameters = useRecoilValue(parametersState);
  const temperature = useRecoilValue(temperatureState);
  const setResults = useSetRecoilState(resultsState);
  const [generationInProgress, setGenerationInProgress] = useState(false);
  const saveResults = useSaveResults();

  const generateResults = useCallback(async () => {
    const finalPrompt = renderPrompt(prompt, parameters);
    const { queryId, response } = await firefallService.complete(finalPrompt, temperature);
    setResults((results) => [...results, {
      id: queryId,
      variants: createVariants(uuid, response),
      prompt: finalPrompt,
      promptTemplate: prompt,
      parameters,
      temperature,
    }]);
    await saveResults();
  }, [firefallService, prompt, parameters, temperature]);

  const handleGenerate = useCallback(() => {
    sampleRUM('genai:prompt:generate', { source: 'GenerateButton#handleGenerate' });
    setGenerationInProgress(true);
    generateResults()
      .catch((error) => {
        switch (error.status) {
          case 400:
            ToastQueue.negative('The response was filtered due to the prompt triggering Sensei GenAI\'s content management policy. Please modify your prompt and retry.', { timeout: 2000 });
            break;
          default:
            ToastQueue.negative('Something went wrong. Please try again!', { timeout: 2000 });
        }
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
        {generationInProgress ? <ProgressCircle size="S" aria-label="Generate" isIndeterminate right="8px" /> : <GenAIIcon marginEnd={'8px'}/>}
        Generate
      </Button>
      <ContextualHelp variant="info">
        <Heading>Terms of use</Heading>
        <Content>
          <p>
            Your inputs to the service should be tied to a context.This context can be your branding
            materials, website content, data, schemas for such data, templates, or other trusted documents.
            You should evaluate the accuracy of any output as appropriate to your use case.
          </p>
          <LegalTermsLink />
        </Content>
      </ContextualHelp>
    </Flex>
  );
}
