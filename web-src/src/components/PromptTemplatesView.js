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
import { useIntl } from 'react-intl';

import { intlMessages } from './App.l10n.js';
import {
  customPromptTemplatesState, NEW_PROMPT_TEMPLATE_ID,
  promptTemplatesState,
  reconcileCustomPromptTemplates,
} from '../state/PromptTemplatesState.js';
import { PromptTemplateCard } from './PromptTemplateCard.js';
import { sessionState } from '../state/SessionState.js';
import { ViewType, viewTypeState } from '../state/ViewType.js';
import { lastUsedPromptTemplateIdState } from '../state/LastUsedPromptTemplateIdState.js';
import { log, analytics } from '../helpers/MetricsHelper.js';
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

  const { formatMessage } = useIntl();

  const handleSelect = useCallback(({
    id, label, description, template, isBundled,
  }) => {
    let logRecords = {
      isBundled,
      description,
      label,
    };
    log('prompt:selected', logRecords);
    analytics({
      widget: {
        name: 'Prompt Template',
        type: 'NA',
      },
      element: 'Select Prompt',
      elementId: 'prompt:selected',
      type: 'button',
      action: 'click',
    }, logRecords);
    if (id === NEW_PROMPT_TEMPLATE_ID) {
      logRecords = { source: 'HomePanel#handleSelect' };
      log('prompt:new', logRecords);
      analytics({
        widget: {
          name: 'Prompt Template',
          type: 'NA',
        },
        element: 'New Prompt',
        elementId: 'prompt:new',
        type: 'button',
        action: 'click',
      }, logRecords);
    } else {
      logRecords = { source: 'HomePanel#handleSelect' };
      const promptType = isBundled ? 'isadobeselected' : 'iscustomselected';
      log(`prompt:${promptType}`, logRecords);
      analytics({
        widget: {
          name: 'Prompt Template',
          type: 'NA',
        },
        element: 'Existing Prompt',
        elementId: `prompt:${promptType}`,
        type: 'button',
        action: 'click',
      }, logRecords);
    }
    setCurrentSession(createNewSession(label, description, template));
    setViewType(ViewType.CurrentSession);
    setLastUsedPromptTemplateId(id);
  }, [setCurrentSession, setViewType]);

  const handleDelete = useCallback(() => {
    reconcileCustomPromptTemplates([], [templateToDelete], runMode)
      .then((newCustomPromptTemplates) => {
        setTemplateToDelete(null);
        setCustomPromptTemplates(newCustomPromptTemplates);
      })
      .catch((error) => {
        ToastQueue.negative(formatMessage(intlMessages.app.deletePromptTemplateFailedToast), { timeout: 1000 });
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
            title={formatMessage(intlMessages.app.deleteActionTitle)}
            variant="destructive"
            primaryActionLabel={formatMessage(intlMessages.app.deleteActionLabel)}
            secondaryActionLabel={formatMessage(intlMessages.app.cancelActionLabel)}
            onPrimaryAction={handleDelete}
            onSecondaryAction={() => setTemplateToDelete(null)}>
            {formatMessage(intlMessages.app.deletePromptTemplateQuestion)}
          </AlertDialog>)
        }
      </DialogContainer>
    </>
  );
}
