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
import React from 'react';
import { ToastContainer } from '@react-spectrum/toast';
import {
  Text, Flex, Grid, Switch, View,
} from '@adobe/react-spectrum';
import { atom, useRecoilState } from 'recoil';
import ResultsView from './ResultsView.js';
import Editor from './Editor.js';
import { ParametersView } from './ParametersView.js';
import { PromptTemplatePicker } from './PromptTemplatePicker.js';
import { useApplicationContext } from './ApplicationProvider.js';
import { GenerateButton } from './GenerateButton.js';
import { CreativitySelector } from './CreativitySelector.js';

export const showPromptState = atom({
  key: 'showPromptState',
  default: true,
});

export const sourceViewState = atom({
  key: 'sourceViewState',
  default: false,
});

function App() {
  const { appVersion } = useApplicationContext();
  const [showPrompt, setShowPrompt] = useRecoilState(showPromptState);
  const [sourceView, setSourceView] = useRecoilState(sourceViewState);
  return (
    <>
      <ToastContainer />
      <Grid
        areas={['header1 header1 header2', 'editor parameters results', 'footer1 footer1 footer2']}
        columns={['1.5fr', 'minmax(0, auto)', '1fr']}
        rows={['min-content', 'auto', 'min-content']}
        gap={'size-200'}
        UNSAFE_style={{ padding: '30px' }}
        width="100%" height="100%">
        <Flex gridArea={'header1'} direction={'row'} gap={'size-400'} alignItems={'last baseline'}>
          <PromptTemplatePicker />
          <Switch gridArea={'header1'} isSelected={sourceView} onChange={setSourceView} isDisabled={!showPrompt}>Edit Mode</Switch>
        </Flex>
        <Flex gridArea={'header2'} direction={'row'} gap={'size-400'} alignItems={'last baseline'} justifyContent={'end'}>
          <Switch isSelected={showPrompt} onChange={setShowPrompt}>Show Prompt</Switch>
        </Flex>
        <Flex gridArea={'editor'} direction={'column'}>
          <Editor />
        </Flex>
        <View gridArea={'parameters'}>
          <ParametersView />
        </View>
        <View gridArea={'results'}>
          <ResultsView gridArea={'results'} />
        </View>
        <Flex gridArea={'footer1'} direction={'row'} gap={'size-400'} alignItems={'center'}>
          <GenerateButton />
          <CreativitySelector />
        </Flex>
        <Flex gridArea={'footer2'} direction={'row'} gap={'size-400'} alignItems={'center'} justifyContent={'end'}>
          <Text justifySelf={'end'}>v{appVersion}</Text>
        </Flex>
      </Grid>
    </>
  );
}

export default App;
