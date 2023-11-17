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
import React from 'react';
import { PromptPropertiesPanel } from './PromptPropertiesPanel.js';
import { ResultsView } from './ResultsView.js';
import PromptEditor from './PromptEditor.js';

export function CurrentSessionPanel() {
  return (
    <Grid
      columns={['330px', '1fr']}
      rows={['100%']}
      justifyContent={'stretch'}
      alignItems={'stretch'}
      gap={'size-300'}
      height={'100%'}
      UNSAFE_style={{
        background: 'white', margin: '0 20px 0 20px', borderRadius: '20px 20px 0 0', border: '2px #e0e0e0 solid',
      }}>
      <PromptPropertiesPanel />
      <Grid UNSAFE_style={{ padding: '20px 20px 20px 0' }} columns={'1fr'} rows={['1fr', 'min-content']} alignItems={'center'} justifyContent={'center'} gap={25}>
        <Flex direction={'column'} UNSAFE_style={{
          overflow: 'auto', position: 'relative', width: '100%', height: '100%',
        }}>
          <ResultsView />
        </Flex>
        <PromptEditor flexGrow={0} />
      </Grid>
    </Grid>
  );
}
