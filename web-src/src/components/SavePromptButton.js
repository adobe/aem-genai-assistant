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
  ActionButton,
  Image,
  Text,
  DialogTrigger,
  Dialog,
  Content,
  Heading,
  Divider,
  ButtonGroup,
  Button,
  Item,
  TextArea, ComboBox, Switch, Well, Form,
} from '@adobe/react-spectrum';
import React, { useCallback, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 as uuid } from 'uuid';
import SharedTemplateIcon from '@spectrum-icons/workflow/UserGroup';
import PrivateTemplateIcon from '@spectrum-icons/workflow/LockClosed';
import { ToastQueue } from '@react-spectrum/toast';
import { motion } from 'framer-motion';
import { useIntl } from 'react-intl';

import { intlMessages } from './PromptSessionSideView.l10n.js';
import { promptState } from '../state/PromptState.js';
import SaveIcon from '../assets/save.svg';
import {
  customPromptTemplatesState, reconcileCustomPromptTemplates,
} from '../state/PromptTemplatesState.js';
import { useShellContext } from './ShellProvider.js';
import { lastUsedPromptTemplateIdState } from '../state/LastUsedPromptTemplateIdState.js';
import { log, analytics } from '../helpers/MetricsHelper.js';
import { useApplicationContext } from './ApplicationProvider.js';

const DEBOUNCE_DELAY = 800;

function debounce(callback, wait) {
  let timeoutId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      clearTimeout(timeoutId);
      callback(...args);
    }, wait);
  };
}

function updateTemplates(templatesToUpsert, templatesToDelete, runMode, formatMessage) {
  return reconcileCustomPromptTemplates(templatesToUpsert, templatesToDelete, runMode)
    .then((updatedPromptTemplates) => {
      ToastQueue.positive(formatMessage(intlMessages.promptSessionSideView.savePromptSuccessToast), { timeout: 1000 });
      return updatedPromptTemplates;
    }).catch((error) => {
      ToastQueue.negative(formatMessage(intlMessages.promptSessionSideView.savePromptFailureToast), { timeout: 1000 });
      console.error(error);
    });
}

export function SavePromptButton(props) {
  const { runMode } = useApplicationContext();
  const { user: { name, locale } } = useShellContext();

  const [customPromptTemplates, setCustomPromptTemplates] = useRecoilState(customPromptTemplatesState);
  const [lastUsedPromptTemplateId, setLastUsedPromptTemplateId] = useRecoilState(lastUsedPromptTemplateIdState);
  const prompt = useRecoilValue(promptState);

  const [selectedTemplate, setSelectedTemplate] = React.useState(null);
  const [label, setLabel] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isShared, setIsShared] = React.useState(false);

  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const { formatMessage } = useIntl();

  useEffect(() => {
    if (selectedTemplate) {
      if (label !== selectedTemplate.label) {
        setLabel(selectedTemplate.label);
      }
      setDescription(selectedTemplate?.description ?? selectedTemplate?.label);
      setIsShared(selectedTemplate?.isShared);
    } else {
      setDescription('');
    }
  }, [selectedTemplate]);

  const updateLabel = useCallback(debounce((value) => {
    const template = customPromptTemplates.find((t) => t.label === value);
    if (template) {
      setSelectedTemplate(template);
    } else {
      setLabel(value);
      setSelectedTemplate(null);
    }
    setIsUpdating(false);
  }, DEBOUNCE_DELAY), [selectedTemplate, customPromptTemplates]);

  const saveNewTemplate = useCallback((closeDialog) => {
    setIsSaving(true);
    const newTemplate = {
      id: uuid(),
      label,
      description: description || label,
      template: prompt,
      modes: [runMode],
      isShared,
      isBundled: false,
      created: new Date().getTime(),
      lastModified: new Date().getTime(),
      createdBy: name,
      lastModifiedBy: name,
    };
    updateTemplates([newTemplate], [], runMode, formatMessage).then((newCustomPromptTemplates) => {
      const logRecords = {
        id: newTemplate.id,
        label: newTemplate.label,
        description: newTemplate.description,
        isShared: newTemplate.isShared,
        lastModified: newTemplate.lastModified,
        lastModifiedBy: newTemplate.lastModifiedBy,
      };
      log('prompt:save:create', logRecords);
      analytics({
        widget: {
          name: 'Prompt Template',
          type: 'NA',
        },
        element: 'New Prompt',
        elementId: 'prompt:save:create',
        type: 'button',
        action: 'click',
      }, logRecords);
      setCustomPromptTemplates(newCustomPromptTemplates);
      setLastUsedPromptTemplateId(newTemplate.id);
      setSelectedTemplate(newTemplate);
      setIsSaving(false);
      closeDialog();
    });
  }, [label, description, isShared, prompt, customPromptTemplates]);

  const saveSelectedTemplate = useCallback((closeDialog) => {
    setIsSaving(true);
    const updatedTemplate = {
      ...selectedTemplate,
      description: description || label,
      template: prompt,
      isShared,
      lastModified: new Date().getTime(),
      lastModifiedBy: name,
    };
    updateTemplates([updatedTemplate], [], runMode, formatMessage).then((newCustomPromptTemplates) => {
      const logRecords = {
        id: updatedTemplate.id,
        label: updatedTemplate.label,
        description: updatedTemplate.description,
        isShared: updatedTemplate.isShared,
        lastModified: updatedTemplate.lastModified,
        lastModifiedBy: updatedTemplate.lastModifiedBy,
      };
      log('prompt:save:update', logRecords);
      analytics({
        widget: {
          name: 'Prompt Template',
          type: 'NA',
        },
        element: 'Existing Prompt',
        elementId: 'prompt:save:update',
        type: 'button',
        action: 'click',
      }, logRecords);
      setCustomPromptTemplates(newCustomPromptTemplates);
      setLastUsedPromptTemplateId(updatedTemplate.id);
      setSelectedTemplate(updatedTemplate);
      setIsSaving(false);
      closeDialog();
    });
  }, [label, description, isShared, prompt, selectedTemplate, customPromptTemplates]);

  const renderTemplates = useCallback(() => {
    return customPromptTemplates.slice().sort((a, b) => a.label.localeCompare(b.label)).map((template) => (
      <Item key={template.id} textValue={template.label}>
        { template.isShared
          ? <SharedTemplateIcon UNSAFE_style={{ boxSizing: 'content-box' }}/>
          : <PrivateTemplateIcon UNSAFE_style={{ boxSizing: 'content-box' }}/> }
        <Text>{ template.label }</Text>
      </Item>
    ));
  }, [customPromptTemplates]);

  const renderWarning = useCallback(() => {
    if (!selectedTemplate) {
      return null;
    }
    const lastModified = new Date(selectedTemplate.lastModified).toLocaleString(locale, {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

    return (
      <motion.div
        initial={{ opacity: 0.1, scaleY: 0.1 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ ease: 'easeInOut', duration: 0.3 }}>
        <Well>
        <Text>
          {formatMessage(intlMessages.promptSessionSideView.savePromptUpdateWarning, {
            b: (chunks) => <b>{chunks}</b>,
            label,
            lastModified,
            lastModifiedBy: selectedTemplate.lastModifiedBy,
          })}
        </Text>
      </Well>
      </motion.div>
    );
  }, [selectedTemplate, label]);

  const handleDialogOpening = useCallback(() => {
    if (lastUsedPromptTemplateId) {
      setSelectedTemplate(customPromptTemplates.find((t) => t.id === lastUsedPromptTemplateId));
    } else {
      setSelectedTemplate(null);
    }
  }, [lastUsedPromptTemplateId, customPromptTemplates]);

  const handleLabelChange = useCallback((value) => {
    setIsUpdating(true);
    updateLabel(value);
  }, [customPromptTemplates]);

  const handleSelectionChange = useCallback((selection) => {
    const template = customPromptTemplates.find((t) => t.id === selection);
    if (!template) {
      return;
    }
    setSelectedTemplate(template);
    setLabel(template.label);
    setDescription(template.description);
  }, [customPromptTemplates]);

  const handleSave = useCallback((closeDialog) => {
    if (selectedTemplate) {
      saveSelectedTemplate(closeDialog);
    } else {
      saveNewTemplate(closeDialog);
    }
  }, [label, description, isShared, prompt, selectedTemplate, customPromptTemplates]);

  return (
    <DialogTrigger type='modal'>
      <ActionButton
        {...props}
        onPress={handleDialogOpening}
        UNSAFE_className="hover-cursor-pointer"
        isQuiet
        variant={''}>
        <Image src={SaveIcon} alt={'Save'} marginEnd={'8px'} />
        <Text>{formatMessage(intlMessages.promptSessionSideView.savePromptButtonLabel)}</Text>
      </ActionButton>
      {(close) => (
        <Dialog width={'480px'}>
          <Heading>{formatMessage(intlMessages.promptSessionSideView.savePromptButtonLabel)}</Heading>
          <Divider />
          <Content>
            <Form onSubmit={(e) => e.preventDefault()}>
              <Text marginBottom={10}>
                {formatMessage(intlMessages.promptSessionSideView.savePromptInstructionsLabel)}
              </Text>
              <ComboBox
                label={formatMessage(intlMessages.promptSessionSideView.savePromptNameLabel)}
                width={'100%'}
                isRequired={true}
                allowsCustomValue={true}
                selectedKey={selectedTemplate?.id}
                autoFocus={true}
                onInputChange={handleLabelChange}
                onSelectionChange={handleSelectionChange}>
                {renderTemplates()}
              </ComboBox>
              <TextArea
                label={formatMessage(intlMessages.promptSessionSideView.savePromptDescriptionLabel)}
                width={'100%'}
                value={description}
                onChange={setDescription}>
              </TextArea>
              <Switch
                isSelected={isShared}
                onChange={setIsShared}>
                {formatMessage(intlMessages.promptSessionSideView.savePromptSharedSwitchLabel)}
              </Switch>
              { renderWarning() }
            </Form>
          </Content>
          <ButtonGroup>
            <Button variant={'secondary'} onPress={close}>{formatMessage(intlMessages.promptSessionSideView.cancelActionLabel)}</Button>
            <Button variant={'cta'} isDisabled={!label || isUpdating || isSaving} onPress={() => handleSave(close)}>{formatMessage(intlMessages.promptSessionSideView.saveActionLabel)}</Button>
          </ButtonGroup>
        </Dialog>
      )}
    </DialogTrigger>
  );
}
