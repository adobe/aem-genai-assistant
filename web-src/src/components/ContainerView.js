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
import React, {useState} from 'react';
import {
  Content, Grid, Heading, IllustratedMessage, Item, ListView, View, Text,
} from '@adobe/react-spectrum';
import WriteIcon from '../icons/WriteIcon.js';
import Editor from './Editor.js';

function ContainerView() {
  const [results, setResults] = useState([]);

  return (
    <Grid
      areas={[
        'prompt variations',
      ]}
      columns={['2fr', '1.5fr']}
      rows={['minmax(0, 1fr)']}
      height="100%">
      <View gridArea="prompt" UNSAFE_style={{ paddingRight: '30px', height: '100%' }}>
        <Editor setResults={setResults} />
      </View>
      <ListView
        UNSAFE_style={{ border: '2px solid lightgray', borderRadius: '10px' }}
        maxWidth="size-6000"
        items={results.map((result) => ({ key: result, textValue: result }))}
        renderEmptyState={() => (
            <IllustratedMessage>
              <WriteIcon size="S" />
              <Heading>Nothing here yet</Heading>
              <Content>Type in a prompt to generate content</Content>
            </IllustratedMessage>
          )}>
        {(item) => (
          <Item key={item.key} textValue="Utilities" hasChildItems>
            <View>
              <Text>{item.textValue}</Text>
            </View>
          </Item>
        )}
      </ListView>
    </Grid>
  );
}

export default ContainerView;
