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
  TextArea, ComboBox, Item, ButtonGroup, Button, Grid,
} from '@adobe/react-spectrum';
import { useApplicationContext } from './ApplicationProvider.js';

function Editor() {
  const { completionService } = useApplicationContext();
  return (
    <Grid
      columns={['1fr']}
      rows={['min-content', 'auto', 'min-content']}
      gap="size-200"
      margin={0}
      width="100%" height="100%">
      <ComboBox label="Prompt Template">
        <Item key="prompt1">Prompt 1</Item>
        <Item key="prompt2">Prompt 2</Item>
        <Item key="prompt3">Prompt 3</Item>
      </ComboBox>
      <TextArea width="100%" height="100%" />
      <ButtonGroup>
        <Button variant="primary" onPress={() => console.log(completionService.complete('prompt', 0.1))}>Generate</Button>
      </ButtonGroup>
    </Grid>
  );
}

export default Editor;
