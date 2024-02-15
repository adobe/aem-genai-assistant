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
  TextArea, ComboBox, Checkbox,
} from '@adobe/react-spectrum';
import React, { useCallback, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 as uuid } from 'uuid';
import { ToastQueue } from '@react-spectrum/toast';
import { promptState } from '../state/PromptState.js';
import SaveIcon from '../assets/save.svg';
import {
  customPromptTemplatesState,
  writeCustomPromptTemplates,
} from '../state/PromptTemplatesState.js';

function saveTemplates(customPromptTemplates) {
  return writeCustomPromptTemplates(customPromptTemplates).then(() => {
    ToastQueue.positive('Prompt template saved', 1000);
  }).catch((error) => {
    ToastQueue.negative('Error saving prompt template', 1000);
    console.error(error);
  });
}

export function SavePromptButton(props) {
  const [customPromptTemplates, setCustomPromptTemplates] = useRecoilState(customPromptTemplatesState);
  const [selection, setSelection] = React.useState(null);
  const [label, setLabel] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isPrivate, setIsPrivate] = React.useState(false);
  const prompt = useRecoilValue(promptState);

  useEffect(() => {
    if (selection) {
      const selectedTemplate = customPromptTemplates.find((template) => template.id === selection);
      setDescription(selectedTemplate?.description ?? '');
      setIsPrivate(selectedTemplate?.isPrivate);
    } else {
      setDescription('');
    }
  }, [selection, customPromptTemplates, setDescription]);

  const handleSave = useCallback((close) => {
    console.log('Saving prompt template as', isPrivate ? 'private' : 'public');

    if (selection) {
      const selectedTemplate = customPromptTemplates.find((template) => template.id === selection);
      const updatedTemplate = {
        ...selectedTemplate,
        description,
        template: prompt,
        isPrivate,
      };
      const newCustomPromptTemplates = [
        ...customPromptTemplates.filter((template) => template.id !== selection),
        updatedTemplate,
      ];
      setCustomPromptTemplates(newCustomPromptTemplates);
      saveTemplates(newCustomPromptTemplates).then(close);
    } else {
      const newTemplate = {
        id: uuid(),
        label,
        description,
        template: prompt,
        isPrivate,
      };
      const newCustomPromptTemplates = [...customPromptTemplates, newTemplate];
      setCustomPromptTemplates(newCustomPromptTemplates);
      saveTemplates(newCustomPromptTemplates).then(() => {
        setSelection(newTemplate.id);
        close();
      });
    }
  }, [customPromptTemplates, description, isPrivate, label, prompt, selection, setCustomPromptTemplates]);

  return (
    <DialogTrigger type='modal'>
      <ActionButton
        {...props}
        onPress={() => setSelection(null)}
        UNSAFE_className="hover-cursor-pointer"
        isQuiet
        variant={''}>
        <Image src={SaveIcon} alt={'Save'} marginEnd={'8px'} />
        <Text>Save Prompt</Text>
      </ActionButton>
      {(close) => (
        <Dialog>
          <Heading>Save Prompt</Heading>
          <Divider />
          <Content>
            <Text>
              Enter a new name to create a new prompt, or select an existing one from the list to update it.
            </Text>
            <ComboBox
              label={'Prompt Name'}
              width={'100%'}
              isRequired={true}
              allowsCustomValue={true}
              selectedKey={selection}
              onInputChange={setLabel}
              onSelectionChange={setSelection}>
              {
                customPromptTemplates.slice().sort((a, b) => a.label.localeCompare(b.label)).map((template) => (
                  <Item key={template.id}>{ template.label }</Item>
                ))
              }
            </ComboBox>
            <TextArea
              label={'Description'}
              width={'100%'}
              isRequired
              value={description}
              onChange={setDescription}>
            </TextArea>
            <Checkbox
              isSelected={isPrivate}
              onChange={setIsPrivate}>
              Save As Private
            </Checkbox>
          </Content>
          <ButtonGroup>
            <Button variant={'secondary'} onPress={close}>Cancel</Button>
            <Button variant={'cta'} isDisabled={!label || !description} onPress={() => handleSave(close)}>Save</Button>
          </ButtonGroup>
        </Dialog>
      )}
    </DialogTrigger>
  );
}
