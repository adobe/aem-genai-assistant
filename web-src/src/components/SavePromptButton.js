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
  ActionButton, Image, Text, DialogTrigger, Dialog, Content, Link, Heading, Divider,
} from '@adobe/react-spectrum';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { useApplicationContext } from './ApplicationProvider.js';
import { promptState } from '../state/PromptState.js';
import SaveIcon from '../assets/save.svg';

function PromptTemplatesLink({ url }) {
  return (
    <Link target="_blank" href={url} UNSAFE_style={{ textDecoration: 'underline', color: 'blue' }}>here</Link>
  );
}

export function SavePromptButton(props) {
  const { websiteUrl, promptTemplatesPath } = useApplicationContext();
  const fileUrl = `${websiteUrl}/${promptTemplatesPath}.json`;
  const prompt = useRecoilValue(promptState);

  const handleSave = () => {
    navigator.clipboard.writeText(prompt);
  };

  return (
    <DialogTrigger isDismissable type='modal'>
      <ActionButton
        {...props}
        UNSAFE_className="hover-cursor-pointer"
        isQuiet
        onPress={handleSave}
        variant={''}>
        <Image src={SaveIcon} alt={'Save'} marginEnd={'8px'} />
        <Text>Save Prompt</Text>
      </ActionButton>
      <Dialog>
        <Heading>Save Prompt</Heading>
        <Divider />
        <Content>
          <strong>Follow the steps below to save your prompt as a Prompt Template for future use across your
            Organization:</strong>
          <p>
            1. Click <PromptTemplatesLink url={fileUrl} /> to open the prompt that you want to save. It will open in a
            new tab.
          </p>
          <p>
            2. In the new tab, select <strong>Edit</strong> in Sidekick. This will open the prompt library template.
          </p>
          <p>
            3. Your prompt has been automatically copied to your clipboard. Paste it into a new row in the Template
            column.
          </p>
          <p>
            4. Give the new template a Name and Description.
          </p>
        </Content>
      </Dialog>
    </DialogTrigger>
  );
}
