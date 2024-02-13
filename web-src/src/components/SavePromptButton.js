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
  TextArea, ComboBox,
} from '@adobe/react-spectrum';
import React, { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ToastQueue } from '@react-spectrum/toast';
import { v4 as uuid } from 'uuid';
import { useApplicationContext } from './ApplicationProvider.js';
import { promptState } from '../state/PromptState.js';
import SaveIcon from '../assets/save.svg';
import { NEW_PROMPT_TEMPLATE_ID, promptTemplatesState } from '../state/PromptTemplatesState.js';

export function SavePromptButton(props) {
  const { savePromptTemplates } = useApplicationContext();
  const [promptTemplates, setPromptTemplates] = useRecoilState(promptTemplatesState);
  const [selection, setSelection] = React.useState(null);
  const [label, setLabel] = React.useState('');
  const [description, setDescription] = React.useState('');
  const prompt = useRecoilValue(promptState);

  useEffect(() => {
    if (selection) {
      console.log(`Selection: ${selection}`);
      const template = promptTemplates.find((t) => t.id === selection);
      console.log(template);
      setDescription(template?.description);
    } else {
      setDescription('');
    }
  }, [selection]);

  const handleSave = (close) => {
    console.log('Saving prompt...');
    console.log(`Selection: ${selection}`);
    console.log(`Label: ${label}`);
    console.log(`Description: ${description}`);
    console.log(prompt);

    const newPromptTemplates = promptTemplates.map((template) => {
      console.log(template);
      if (template.id === selection) {
        return {
          ...template,
          description,
          template: prompt,
        };
      }
      return template;
    });

    if (!selection) {
      const newId = uuid();
      newPromptTemplates.splice(newPromptTemplates.length - 1, 0, {
        id: newId,
        label,
        description,
        template: prompt,
        isBundled: false,
      });
      setSelection(newId);
    }

    console.log(newPromptTemplates);

    setPromptTemplates(newPromptTemplates);

    savePromptTemplates(newPromptTemplates).then(() => {
      ToastQueue.positive('Prompt template saved', 1000);
      close();
    }).catch((error) => {
      ToastQueue.negative('Error saving prompt template', 1000);
      console.error(error);
    });
  };

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
            <ComboBox
              label={'Save as'}
              width={'100%'}
              allowsCustomValue={true}
              selectedKey={selection}
              onInputChange={setLabel}
              onSelectionChange={setSelection}>
              {promptTemplates
                .filter((template) => !template.isBundled && template.id !== NEW_PROMPT_TEMPLATE_ID)
                .map((template) => (
                  <Item key={template.id}>
                    {template.label}
                  </Item>
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
          </Content>
          <ButtonGroup>
            <Button variant={'cta'} isDisabled={!label || !description} onPress={() => handleSave(close)}>Save</Button>
            <Button variant={'secondary'} onPress={close}>Cancel</Button>
          </ButtonGroup>
        </Dialog>
      )}
    </DialogTrigger>
  );
}
