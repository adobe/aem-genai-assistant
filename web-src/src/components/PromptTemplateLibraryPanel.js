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
import { Grid, Heading, ProgressCircle } from '@adobe/react-spectrum';

import React, { Suspense, useCallback } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 as uuid } from 'uuid';
import { ErrorBoundary } from 'react-error-boundary';
import { ToastQueue } from '@react-spectrum/toast';
import { PromptTemplateCard } from './PromptTemplateCard.js';
import { sessionState } from '../state/SessionState.js';
import { ViewType, viewTypeState } from '../state/ViewType.js';
import { formatTimestamp } from '../helpers/FormatHelper.js';
import {
  customPromptTemplatesState,
  promptTemplatesState, writeCustomPromptTemplates,
} from '../state/PromptTemplatesState.js';
import { WelcomeBanner } from './WelcomeBanner.js';
import { sampleRUM } from '../rum.js';
import { log } from '../helpers/Tracking.js';
import { lastUsedPromptTemplateIdState } from '../state/LastUsedPromptTemplateIdState.js';

function PromptTemplatesView({ onSelect }) {
  const promptTemplates = useRecoilValue(promptTemplatesState);
  const [customPromptTemplates, setCustomPromptTemplates] = useRecoilState(customPromptTemplatesState);

  const handleDelete = useCallback((selectedTemplate) => {
    const newCustomPromptTemplates = customPromptTemplates
      .filter((template) => template.label !== selectedTemplate.label);
    setCustomPromptTemplates([...newCustomPromptTemplates]);
    writeCustomPromptTemplates(newCustomPromptTemplates).then(() => {
      ToastQueue.positive('Prompt template deleted', 1000);
    }).catch((error) => {
      ToastQueue.negative('Failed to delete prompt template', 1000);
      console.error(error);
    });
  }, [customPromptTemplates, setCustomPromptTemplates]);

  return (
    <Grid
      data-testid={'prompt-templates-view'}
      width={'100%'}
      alignItems={'center'}
      columns={'repeat(auto-fill, minmax(250px, 1fr))'}
      gap={'size-200'}>
      {
        promptTemplates
        && promptTemplates
          .map((template, index) => (
            <PromptTemplateCard
              key={index}
              template={template}
              onClick={() => onSelect(promptTemplates[index])}
              onDelete={handleDelete} />
          ))
      }
    </Grid>
  );
}

export function PromptTemplateLibraryPanel({ props }) {
  const setCurrentSession = useSetRecoilState(sessionState);
  const setViewType = useSetRecoilState(viewTypeState);
  const setLastUsedPromptTemplateId = useSetRecoilState(lastUsedPromptTemplateIdState);

  const handleSelect = useCallback((selectedTemplate) => {
    log('prompt:selected', {
      isBundled: selectedTemplate.isBundled,
      description: selectedTemplate.description,
      label: selectedTemplate.label,
    });
    if (selectedTemplate.isNew) {
      sampleRUM('genai:prompt:new', { source: 'HomePanel#handleSelect' });
    } else {
      sampleRUM(`genai:prompt:${selectedTemplate.isBundled ? 'isadobeselected' : 'iscustomselected'}`, { source: 'HomePanel#handleSelect' });
    }
    const timestamp = Date.now();
    const session = {
      id: uuid(),
      name: `${selectedTemplate.label} ${formatTimestamp(timestamp)}`,
      description: selectedTemplate.description,
      timestamp,
      prompt: selectedTemplate.template,
      parameters: {},
      results: [],
    };
    setCurrentSession(session);
    setViewType(ViewType.CurrentSession);
    setLastUsedPromptTemplateId(selectedTemplate.id);
  }, [setCurrentSession, setViewType]);

  return (
    <Grid
      {...props}
      columns={['1fr']}
      rows={['min-content', 'min-content', '1fr']}
      height={'100%'}
      UNSAFE_style={{
        padding: '25px 50px', overflow: 'auto',
      }}>

      <div tabIndex={0}>
        <WelcomeBanner />

        <Heading level={3} alignSelf={'start'}>Prompt Templates</Heading>

        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Suspense fallback={<ProgressCircle isIndeterminate />}>
            <PromptTemplatesView onSelect={handleSelect}/>
          </Suspense>
        </ErrorBoundary>
      </div>
    </Grid>
  );
}
