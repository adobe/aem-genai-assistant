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
import { Flex, Grid } from '@adobe/react-spectrum';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { PromptSessionSideView } from './PromptSessionSideView.js';
import { PromptResultListView } from './PromptResultListView.js';
import PromptEditor from './PromptEditor.js';
import { promptEditorState } from '../state/PromptEditorState.js';
import { log } from '../helpers/MetricsHelper.js';

export function PromptSessionPanel() {
  const [isOpenPromptEditor, setIsOpenPromptEditor] = useRecoilState(promptEditorState);
  const [promptEditorError, setPromptEditorError] = useState(false);

  useEffect(() => {
    if (isOpenPromptEditor) {
      log('prompt:editor:opened');
    }
  }, [isOpenPromptEditor]);

  return (
    <Grid
      columns={['1fr', '2fr']}
      rows={['100%']}
      justifyContent={'stretch'}
      alignItems={'stretch'}
      gap={'size-300'}
      height={'100%'}>

      <PromptSessionSideView isOpenPromptEditor={isOpenPromptEditor}
        onTogglePrompt={() => setIsOpenPromptEditor(!isOpenPromptEditor)}
        disableTextGeneration={promptEditorError} />

      <Grid UNSAFE_style={{ padding: '20px 20px 0 0' }}
        columns={'1fr'}
        rows={['1fr', 'min-content']}
        alignItems={'center'}
        justifyContent={'center'}
        gap={25}
        position='relative'>
        <Flex direction={'column'} UNSAFE_style={{
          overflow: 'auto', position: 'relative', width: '100%', height: '100%',
        }}>
          <PromptResultListView style={{ height: '100%' }} onClick={() => setIsOpenPromptEditor(false)} />
        </Flex>
        <PromptEditor
          isOpen={isOpenPromptEditor}
          onClose={() => setIsOpenPromptEditor(false)}
          error={promptEditorError}
          setError={setPromptEditorError}
        />
      </Grid>
    </Grid>
  );
}
