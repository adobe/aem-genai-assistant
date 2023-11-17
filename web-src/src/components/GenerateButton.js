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
  Button, Content, ContextualHelp, Flex, Heading, Link, ProgressCircle, Text,
} from '@adobe/react-spectrum';
import React, { useCallback } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { ToastQueue } from '@react-spectrum/toast';
import { v4 as uuid } from 'uuid';
import SenseiGenAIIcon from '../icons/GenAIIcon.js';
import { renderExpressions } from '../helpers/ExpressionRenderer.js';
import { useApplicationContext } from './ApplicationProvider.js';
import { useAuthContext } from './ShellAuthProvider.js';
import { promptState } from '../state/PromptState.js';
import { temperatureState } from '../state/TemperatureState.js';
import { resultsState } from '../state/ResultsState.js';
import { generationInProgressState } from '../state/GenerationInProgressState.js';
import { parametersState } from '../state/ParametersState.js';
import { LegalTermsLink } from './LegalTermsLink.js';
import { useSaveSession } from '../state/SaveSessionHook.js';

function objectToString(obj) {
  return String(obj).replace(/<\/?[^>]+(>|$)/g, '');
}

function jsonToString(json) {
  if (json === null || typeof json !== 'object') {
    return objectToString(json);
  }
  return Object.entries(json).map(([key, value]) => {
    return `<b>${key}</b>: ${objectToString(value)}`;
  }).join('<br/>');
}

function createVariants(response) {
  try {
    const json = JSON.parse(response);
    if (Array.isArray(json)) {
      return json.map((item) => ({ id: uuid(), content: jsonToString(item) }));
    } else {
      return [{ id: uuid(), content: String(response) }];
    }
  } catch (error) {
    return [{ id: uuid(), content: String(response) }];
  }
}

export function GenerateButton() {
  const { firefallService } = useApplicationContext();
  const { user } = useAuthContext();
  const prompt = useRecoilValue(promptState);
  const parameters = useRecoilValue(parametersState);
  const temperature = useRecoilValue(temperatureState);
  const setResults = useSetRecoilState(resultsState);
  const [generationInProgress, setGenerationInProgress] = useRecoilState(generationInProgressState);
  const saveSession = useSaveSession();

  const generateResults = useCallback(async () => {
    const finalPrompt = renderExpressions(prompt, parameters);
    const { queryId, response } = await firefallService.complete(finalPrompt, temperature, user.imsToken);
    setResults((results) => [...results, {
      resultId: queryId,
      variants: createVariants(response),
      prompt: finalPrompt,
      promptTemplate: prompt,
      parameters,
      temperature,
    }]);
    await saveSession();
  }, [firefallService, prompt, parameters, temperature]);

  const handleGenerate = useCallback(() => {
    setGenerationInProgress(true);
    generateResults()
      .catch((error) => {
        console.log(error);
        ToastQueue.negative('Something went wrong. Please try again!', { timeout: 2000 });
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
        {generationInProgress ? <ProgressCircle size="S" aria-label="Generate" isIndeterminate right="10px" /> : <SenseiGenAIIcon />}
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
