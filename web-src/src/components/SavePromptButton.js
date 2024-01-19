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
  ActionButton, Image, Text, DialogTrigger, Dialog, Content, Heading, Divider, ButtonGroup, Button, Picker, Item,
} from '@adobe/react-spectrum';
import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ToastQueue } from '@react-spectrum/toast';
import { useApplicationContext } from './ApplicationProvider.js';
import { promptState } from '../state/PromptState.js';
import SaveIcon from '../assets/save.svg';
import { promptTemplatesState } from '../state/PromptTemplatesState.js';

export function SavePromptButton(props) {
  const { savePromptTemplates } = useApplicationContext();
  const [promptTemplates, setPromptTemplates] = useRecoilState(promptTemplatesState);
  const [selection, setSelection] = React.useState(null);
  const prompt = useRecoilValue(promptState);

  const handleSave = (close) => {
    console.log(`Saving prompt as ${selection}`);
    console.log(prompt);
    const newPromptTemplates = promptTemplates.map((template) => {
      console.log(template);
      if (template.label === selection) {
        return {
          ...template,
          template: prompt,
        };
      }
      return template;
    });
    console.log(newPromptTemplates);
    setPromptTemplates(newPromptTemplates);
    savePromptTemplates(newPromptTemplates).then((response) => {
      ToastQueue.positive('Prompt template saved', 1000);
      close();
    }).catch((error) => {
      ToastQueue.negative('Error saving prompt template', 1000);
      console.error(error);
    });
  };

  return (
    <DialogTrigger>
      <ActionButton
        {...props}
        onPress={() => setSelection(null)}
        UNSAFE_className="hover-cursor-pointer"
        isQuiet>
        <Image src={SaveIcon} alt={'Save'} marginEnd={'8px'} />
        <Text>Save Prompt</Text>
      </ActionButton>
      {(close) => (
        <Dialog>
          <Heading>Save Prompt</Heading>
          <Divider />
          <Content>
            <Picker label={'Save as'} width={'300px'} selectedKey={selection} onSelectionChange={setSelection}>
              {promptTemplates
                .filter((template) => !template.isBundled)
                .map((template) => (
                  <Item key={template.label}>
                    {template.label}
                  </Item>
                ))
              }
            </Picker>
          </Content>
          <ButtonGroup>
            <Button variant={'cta'} isDisabled={!selection} onPress={() => handleSave(close)}>Save</Button>
            <Button variant={'secondary'} onPress={close}>Cancel</Button>
          </ButtonGroup>
        </Dialog>
      )}
    </DialogTrigger>
  );
}
