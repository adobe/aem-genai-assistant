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
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import React, { Fragment, useCallback } from 'react';
import { ToastQueue } from '@react-spectrum/toast';
import { AlertDialog, DialogContainer, Grid } from '@adobe/react-spectrum';
import { v4 as uuid } from 'uuid';
import {
  customPromptTemplatesState, NEW_PROMPT_TEMPLATE_ID,
  promptTemplatesState,
  writeCustomPromptTemplates,
} from '../state/PromptTemplatesState.js';
import { PromptTemplateCard } from './PromptTemplateCard.js';
import { sessionState } from '../state/SessionState.js';
import { ViewType, viewTypeState } from '../state/ViewType.js';
import { lastUsedPromptTemplateIdState } from '../state/LastUsedPromptTemplateIdState.js';
import { log } from '../helpers/MetricsHelper.js';
import { sampleRUM } from '../rum.js';
import { formatTimestamp } from '../helpers/FormatHelper.js';
import { useApplicationContext } from './ApplicationProvider.js';

export function createNewSession(label, description, prompt) {
  const timestamp = Date.now();
  return {
    id: uuid(),
    name: `${label} ${formatTimestamp(timestamp)}`,
    description,
    timestamp,
    prompt,
    parameters: {},
    results: [],
  };
}

export function PromptTemplatesView() {
  const { runMode } = useApplicationContext();

  const promptTemplates = useRecoilValue(promptTemplatesState);

  const setCurrentSession = useSetRecoilState(sessionState);
  const setViewType = useSetRecoilState(viewTypeState);
  const setLastUsedPromptTemplateId = useSetRecoilState(lastUsedPromptTemplateIdState);

  const [customPromptTemplates, setCustomPromptTemplates] = useRecoilState(customPromptTemplatesState);
  const [templateToDelete, setTemplateToDelete] = React.useState(null);

  const handleSelect = useCallback(({
    id, label, description, template, isBundled,
  }) => {
    log('prompt:selected', {
      isBundled,
      description,
      label,
    });
    if (id === NEW_PROMPT_TEMPLATE_ID) {
      sampleRUM('genai:prompt:new', { source: 'HomePanel#handleSelect' });
    } else {
      const promptType = isBundled ? 'isadobeselected' : 'iscustomselected';
      sampleRUM(`genai:prompt:${promptType}`, { source: 'HomePanel#handleSelect' });
    }
    setCurrentSession(createNewSession(label, description, template));
    setViewType(ViewType.CurrentSession);
    setLastUsedPromptTemplateId(id);
  }, [setCurrentSession, setViewType]);

  const handleDelete = useCallback(() => {
    const newCustomPromptTemplates = customPromptTemplates
      .filter((template) => template.id !== templateToDelete.id);
    return writeCustomPromptTemplates(newCustomPromptTemplates, runMode)
      .then(() => {
        setTemplateToDelete(null);
        setCustomPromptTemplates(newCustomPromptTemplates);
      })
      .catch((error) => {
        ToastQueue.negative('Failed to delete prompt template', { timeout: 1000 });
        console.error(error);
      });
  }, [templateToDelete, customPromptTemplates]);

  return (
    <>
      <Grid
        data-testid={'prompt-templates-view'}
        width={'100%'}
        alignItems={'center'}
        columns={'repeat(auto-fill, minmax(250px, 1fr))'}
        gap={'size-200'}>
        {
          promptTemplates
          && promptTemplates
            .map((template) => (
              <PromptTemplateCard
                key={template.id}
                template={template}
                onClick={handleSelect}
                onDelete={setTemplateToDelete}/>
            ))
        }
      </Grid>
      <DialogContainer onDismiss={() => {}}>
        { templateToDelete
          && (<AlertDialog
            title="Delete"
            variant="destructive"
            primaryActionLabel="Delete"
            secondaryActionLabel="Cancel"
            onPrimaryAction={handleDelete}
            onSecondaryAction={() => setTemplateToDelete(null)}>
            Are you sure you want to delete this prompt?
          </AlertDialog>)
        }
      </DialogContainer>
    </>
  );
}
