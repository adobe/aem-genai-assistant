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
import { Button, ProgressCircle } from '@adobe/react-spectrum';
import React, { useCallback } from 'react';
import {
  atom, useRecoilState, useRecoilValue, useSetRecoilState,
} from 'recoil';
import { ToastQueue } from '@react-spectrum/toast';
import SenseiGenAIIcon from '../icons/SenseiGenAIIcon.js';
import { renderExpressions } from '../helpers/ExpressionRenderer.js';
import { useApplicationContext } from './ApplicationProvider.js';
import { promptState } from './Editor.js';
import { temperatureState } from './CreativitySelector.js';
import { parametersState } from './ParametersView.js';

function objectToString(obj) {
  return String(obj).replace(/<\/?[^>]+(>|$)/g, "");
}

function jsonToString(json) {
  if (json === null || typeof json !== 'object') {
    return objectToString(json);
  }
  return Object.entries(json).map(([key, value]) => {
    return `<b>${key}</b>: ${objectToString(value)}`;
  }).join('<br/>')
}

export const generationResultsState = atom({
  key: 'generationResultsState',
  default: [],
});

export const generationInProgressState = atom({
  key: 'generationInProgressState',
  default: false,
});

export function GenerateButton() {
  const { completionService } = useApplicationContext();
  const prompt = useRecoilValue(promptState);
  const parameters = useRecoilValue(parametersState);
  const temperature = useRecoilValue(temperatureState);
  const setGenerationResults = useSetRecoilState(generationResultsState);
  const [generationInProgress, setGenerationInProgress] = useRecoilState(generationInProgressState);

  const generateHandler = useCallback(() => {
    setGenerationInProgress(true);
    const finalPrompt = renderExpressions(prompt, parameters);
    completionService.complete(finalPrompt, temperature)
      .then((result) => {
        try {
          const json = JSON.parse(result);
          if (Array.isArray(json)) {
            setGenerationResults(json.map((item) => jsonToString(item)));
          } else {
            setGenerationResults([result]);
          }
        } catch (error) {
          setGenerationResults([result]);
        }
      })
      .catch((error) => {
        console.log(error);
        ToastQueue.negative('Something went wrong. Please try again!', { timeout: 2000 });
      })
      .finally(() => {
        setGenerationInProgress(false);
      });
  }, [completionService, prompt, temperature, parameters]);

  return (
    <Button
      UNSAFE_className="hover-cursor-pointer"
      width="size-1700"
      variant="primary"
      style="fill"
      onPress={generateHandler}
      isDisabled={generationInProgress}>
      {generationInProgress ? <ProgressCircle size="S" aria-label="Generate" isIndeterminate right="10px"/> : <SenseiGenAIIcon />}
      Generate
    </Button>
  );
}
