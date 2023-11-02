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
import {
  Content, Grid, Heading, IllustratedMessage, View,
} from '@adobe/react-spectrum';
import WriteIcon from '../icons/WriteIcon.js';
import Editor from './Editor.js';

function ContainerView() {
  return (
    <Grid
      areas={[
        'prompt variations',
      ]}
      columns={['2fr', '1.5fr']}
      rows={['minmax(0, 1fr)']}
      height="100%">
      <View gridArea="prompt" UNSAFE_style={{ paddingRight: '30px', height: '100%' }}>
        <Editor />
      </View>
      <View gridArea="variations" UNSAFE_style={{ paddingLeft: '30px', border: '2px solid lightgray', borderRadius: '10px' }}>
        <IllustratedMessage>
          <WriteIcon size="S"/>
          <Heading>Nothing here yet</Heading>
          <Content>Type in a prompt to generate content</Content>
        </IllustratedMessage>
      </View>
    </Grid>
  );
}

export default ContainerView;
