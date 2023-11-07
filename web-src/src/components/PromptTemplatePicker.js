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
import { Item, Picker } from '@adobe/react-spectrum';
import { useCallback, useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';
import { LinkLabel } from './LinkLabel.js';
import { useApplicationContext } from './ApplicationProvider.js';
import { parseSpreadSheet } from '../helpers/SpreadsheetParser.js';

const PROMPT_TEMPLATES_FILENAME = 'prompttemplates.json';

export const promptTemplatesState = atom({
  key: 'promptTemplatesState',
  default: [],
});

export const promptTemplateState = atom({
  key: 'promptTemplateState',
  default: undefined,
});

export function PromptTemplatePicker() {
  const { websiteUrl } = useApplicationContext();
  const [promptTemplates, setPromptTemplates] = useRecoilState(promptTemplatesState);
  const [, setPrompt] = useRecoilState(promptTemplateState);

  useEffect(() => {
    parseSpreadSheet(`${websiteUrl}/${PROMPT_TEMPLATES_FILENAME}`).then(setPromptTemplates);
  }, []);

  const promptSelectionHandler = useCallback((selected) => {
    setPrompt(promptTemplates[selected]);
  }, [promptTemplates]);

  return (
    <Picker
      label={<LinkLabel label="Prompt Library" url={`${websiteUrl}/${PROMPT_TEMPLATES_FILENAME}`}/>}
      isLoading={!promptTemplates}
      onSelectionChange={promptSelectionHandler}
      width="300px">
      {promptTemplates ? promptTemplates
        .map((template, index) => <Item key={index}>{template.key}</Item>) : []}
    </Picker>
  );
}
