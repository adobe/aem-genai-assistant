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
import { useRecoilState, useRecoilValue } from 'recoil';
import React, { useCallback } from 'react';
import { ToastQueue } from '@react-spectrum/toast';
import { AlertDialog, DialogContainer, Grid } from '@adobe/react-spectrum';
import {
  customPromptTemplatesState,
  promptTemplatesState,
  writeCustomPromptTemplates,
} from '../state/PromptTemplatesState.js';
import { PromptTemplateCard } from './PromptTemplateCard.js';

export function PromptTemplatesView({ onSelect }) {
  const promptTemplates = useRecoilValue(promptTemplatesState);
  const [customPromptTemplates, setCustomPromptTemplates] = useRecoilState(customPromptTemplatesState);

  const [templateToDelete, setTemplateToDelete] = React.useState(null);

  const handleDelete = useCallback(() => {
    const newCustomPromptTemplates = customPromptTemplates
      .filter((template) => template.id !== templateToDelete.id);
    return writeCustomPromptTemplates(newCustomPromptTemplates)
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
            .map((template, index) => (
              <PromptTemplateCard
                key={index}
                template={template}
                onClick={onSelect}
                onDelete={setTemplateToDelete}/>
            ))
        }
      </Grid>
      <DialogContainer onDismiss={() => setTemplateToDelete(null)}>
        { templateToDelete
          && <AlertDialog
            title="Delete"
            variant="destructive"
            primaryActionLabel="Delete"
            secondaryActionLabel="Cancel"
            onPrimaryAction={handleDelete}
            onSecondaryAction={() => setTemplateToDelete(null)}>
            Are you sure you want to delete this prompt?
          </AlertDialog>
        }
      </DialogContainer>
    </>
  );
}
