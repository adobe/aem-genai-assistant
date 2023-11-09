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
  Flex, Grid, Text, ToggleButton,
} from '@adobe/react-spectrum';
import { useRecoilState, useRecoilValue } from 'recoil';
import ResultsView from './ResultsView.js';
import Editor from './Editor.js';
import { ParametersView } from './ParametersView.js';
import { PromptTemplatePicker } from './PromptTemplatePicker.js';
import { useApplicationContext } from './ApplicationProvider.js';
import { GenerateButton } from './GenerateButton.js';
import { CreativitySlider } from './CreativitySlider.js';
import { showPromptState } from '../state/ShowPromptState.js';
import { sourceViewState } from '../state/SourceViewState.js';
import { showParametersState } from '../state/ShowParametersState.js';
import { ConsentDialog } from './ConsentDialog.js';

function getEditorGridColumns(showPrompt, showParameters) {
  if (showPrompt && showParameters) {
    return '1/span 1';
  } else if (showPrompt) {
    return '1/span 2';
  }
  return '';
}

function getParametersGridColumns(showPrompt, showParameters) {
  if (showPrompt && showParameters) {
    return '2/span 1';
  } else if (showParameters) {
    return '1/span 2';
  }
  return '';
}

function getResultsGridColumns(showPrompt, showParameters) {
  if (showPrompt || showParameters) {
    return '3/span 1';
  }
  return '1/span 3';
}

function App() {
  const { appVersion } = useApplicationContext();
  const [showPrompt, setShowPrompt] = useRecoilState(showPromptState);
  const showParameters = useRecoilValue(showParametersState);
  const [sourceView, setSourceView] = useRecoilState(sourceViewState);
  return (
    <>
      <ToastContainer />
      <ConsentDialog />
      <Grid
        columns={['1.5fr', 'minmax(0, 300px)', '1fr']}
        rows={['auto', '1fr', 'auto']}
        gap={'size-300'}
        UNSAFE_style={{ padding: '30px' }}
        width="100%" height="100%">
        <Flex direction={'row'} gap={'size-400'} alignItems={'end'} gridColumn={'1/span 3'}>
          <PromptTemplatePicker />
          <ToggleButton isSelected={sourceView}
            onChange={setSourceView} isDisabled={!showPrompt} >Edit Mode</ToggleButton>
          <ToggleButton isSelected={showPrompt}
            onChange={setShowPrompt}>Show Prompt</ToggleButton>
      </Flex>
        <Editor gridColumn={getEditorGridColumns(showPrompt, showParameters)} />
        <ParametersView gridColumn={getParametersGridColumns(showPrompt, showParameters)} />
        <ResultsView gridColumn={getResultsGridColumns(showPrompt, showParameters)} />
        <Flex direction={'row'} gap={'size-400'} alignItems={'center'} gridColumn={'1/span 2'}>
          <GenerateButton />
          <CreativitySlider />
        </Flex>
        <Flex direction={'row'} gap={'size-400'} alignItems={'center'} justifyContent={'end'}>
          <Text justifySelf={'end'}>v{appVersion}</Text>
        </Flex>
      </Grid>
    </>
  );
}

export default App;
