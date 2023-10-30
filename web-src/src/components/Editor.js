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
import React, { useCallback, useEffect } from 'react';
import {
  Item, ButtonGroup, Button, Grid, Picker, Flex, NumberField, ToggleButton,
} from '@adobe/react-spectrum';
import { default as SimpleEditor } from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import wretch from 'wretch';
import { useApplicationContext } from './ApplicationProvider.js';
import 'prismjs/themes/prism.css';

const EXPRESSION_REGEX = /{\s*([^{}\s]+)\s*}/g;

Prism.languages['custom'] = {
  'function': EXPRESSION_REGEX,
};

function replaceTemplateStrings(str, valuesMap) {
  return str.replace(EXPRESSION_REGEX, (match, key) => {
    return key in valuesMap ? valuesMap[key] : match;
  });
}

function renderPrompt(prompt, segment, variationCount, sourceView) {
  return sourceView ? prompt : replaceTemplateStrings(prompt, { segment, num: variationCount });
}

function Editor() {
  const { websiteUrl, completionService } = useApplicationContext();

  const [promptTemplates, setPromptTemplates] = React.useState([]);
  const [segments, setSegments] = React.useState([]);
  const [segment, setSegment] = React.useState('');
  const [variationCount, setVariationCount] = React.useState(1);
  const [sourceView, setSourceView] = React.useState(false);
  const [prompt, setPrompt] = React.useState('');

  useEffect(() => {
    // Fetch prompt templates
    wretch(`${websiteUrl}/prompttemplates.json`).get().json((json) => {
      setPromptTemplates(json.data.map((row) => ({
        label: row.Label,
        template: row['Prompt Template'],
      })));
    }).catch((error) => {
      console.log(error);
    });
    // Fetch segments
    wretch(`${websiteUrl}/segments.json`).get().json((json) => {
      setSegments(json.data.map((row) => ({
        label: row.Label,
        segment: row.Segment,
      })));
    }).catch((error) => {
      console.log(error);
    });
  }, []);

  const promptSelectionHandler = useCallback((selected) => {
    setPrompt(promptTemplates[selected].template);
  }, [promptTemplates]);

  const segmentSelectionHandler = useCallback((selected) => {
    setSegment(segments[selected].segment);
  }, [segments]);

  return (
    <Grid
      columns={['1fr']}
      rows={['min-content', 'auto', 'min-content']}
      gap="size-200"
      margin={0}
      width="100%" height="100%">
      <Flex direction="row" gap="size-200" alignItems={'end'}>
        <Picker label="Prompt Template" isLoading={!promptTemplates} placeholder="" onSelectionChange={promptSelectionHandler}>
          {promptTemplates ? promptTemplates
            .map((template, index) => <Item key={index}>{template.label}</Item>) : []}
        </Picker>
        <Picker label="Segment" isLoading={!segments} placeholder="" onSelectionChange={segmentSelectionHandler}>
          {segments ? segments
            .map((seg, index) => <Item key={index}>{seg.label}</Item>) : []}
        </Picker>
        <NumberField label="Number Of Variants" defaultValue={4} minValue={1} maxValue={4} onChange={setVariationCount} />
        <ToggleButton isSelected={sourceView} onChange={setSourceView}>Source</ToggleButton>
      </Flex>
      <SimpleEditor
        value={renderPrompt(prompt, segment, variationCount, sourceView)}
        onValueChange={setPrompt}
        highlight={code => highlight(code, languages.custom, 'custom')}
        readOnly={!sourceView}
        style={{
          width: '100%',
          height: '100%',
          fontSize: 16,
          border: '1px solid #ddd',
        }}
      />
      <ButtonGroup>
        <Button variant="primary" onPress={() => console.log(completionService.complete('prompt', 0.1))}>Generate</Button>
      </ButtonGroup>
    </Grid>
  );
}

export default Editor;
