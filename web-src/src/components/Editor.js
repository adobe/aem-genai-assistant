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
  Item, Button, Grid, Picker, Flex, NumberField, Switch, Slider, Link, TextField, View,
} from '@adobe/react-spectrum';
import OpenIcon from '@spectrum-icons/workflow/OpenInLight';
/* eslint-disable-next-line import/no-named-default */
import { default as SimpleEditor } from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import wretch from 'wretch';
import { useApplicationContext } from './ApplicationProvider.js';
import 'prismjs/themes/prism.css';

const EXPRESSION_REGEX = /\{([^|]+?)(?:\|([^}]+?))?\}/g;

const PROMPT_TEMPLATES_FILENAME = 'prompttemplates.json';
const SEGMENTS_FILENAME = 'segments.json';
const BLOCK_TYPES_FILENAME = 'blocktypes.json';

languages.custom = {
  function: EXPRESSION_REGEX,
  variable: /<please select>/,
};

async function fetchPromptTemplates(url) {
  const json = await wretch(`${url}/${PROMPT_TEMPLATES_FILENAME}`).get().json();
  return json.data.map((row) => ({
    label: row.Label,
    template: row['Prompt Template'],
  }));
}

async function fetchSegments(url) {
  const json = await wretch(`${url}/${SEGMENTS_FILENAME}`).get().json();
  return json.data.map((row) => ({
    label: row.Label,
    segment: row.Segment,
  }));
}

async function fetchBlockTypes(url) {
  const json = await wretch(`${url}/${BLOCK_TYPES_FILENAME}`).get().json();
  return json.data.map((row) => ({
    type: row.Type,
    description: row.Description,
  }));
}

function findCustomExpressions(text) {
  const matches = Array.from(text.matchAll(EXPRESSION_REGEX));
  return matches.reduce((acc, match) => {
    if (match[2]) {
      acc.push({
        name: match[1].trim(),
        label: match[2].trim(),
      });
    }
    return acc;
  }, []);
}

function replaceTemplateStrings(str, valuesMap) {
  return str.replace(EXPRESSION_REGEX, (match, key) => {
    return key in valuesMap ? (valuesMap[key] || '<please select>') : '<please select>';
  });
}

/* eslint-disable-next-line max-len */
function renderPrompt(prompt, segment, blockType, blockDescription, customExpressions, variationCount, sourceView) {
  return sourceView ? prompt : replaceTemplateStrings(prompt, {
    segment,
    block_type: blockType,
    block_description: blockDescription,
    ...customExpressions,
    num: variationCount,
  });
}

function getLabelWithOpenLink(label, url) {
  return (
    <>
      {label}&nbsp;<Link target="_blank" href={url}><OpenIcon size="XS"/></Link>
    </>
  );
}

function getCustomComponents(expressions, state, setState) {
  return expressions.map((expression) => {
    return (
        <TextField
          key={expression.name}
          label={expression.label}
          defaultValue={state[expression.name]}
          onChange={(value) => {
            console.log(value);
            setState({ ...state, [expression.name]: value });
          }}
        />
    );
  });
}

function Editor() {
  const { websiteUrl, completionService } = useApplicationContext();

  const [promptTemplates, setPromptTemplates] = React.useState([]);
  const [segments, setSegments] = React.useState([]);
  const [blockTypes, setBlockTypes] = React.useState([]);
  const [segment, setSegment] = React.useState('');
  const [blockType, setBlockType] = React.useState('');
  const [blockDescription, setBlockDescription] = React.useState('');
  const [customExpressions, setCustomExpressions] = React.useState([]);
  const [variationCount, setVariationCount] = React.useState(1);
  const [sourceView, setSourceView] = React.useState(false);
  const [prompt, setPrompt] = React.useState('');

  useEffect(() => {
    /* eslint-disable-next-line no-shadow */
    fetchPromptTemplates(websiteUrl).then((promptTemplates) => setPromptTemplates(promptTemplates));
    /* eslint-disable-next-line no-shadow */
    fetchSegments(websiteUrl).then((segments) => setSegments(segments));
    /* eslint-disable-next-line no-shadow */
    fetchBlockTypes(websiteUrl).then((blockTypes) => setBlockTypes(blockTypes));
  }, []);

  const promptSelectionHandler = useCallback((selected) => {
    setPrompt(promptTemplates[selected].template);
    setSourceView(false);
  }, [promptTemplates]);

  const segmentSelectionHandler = useCallback((selected) => {
    setSegment(segments[selected].segment);
  }, [segments]);

  const blockTypeSelectionHandler = useCallback((selected) => {
    setBlockType(blockTypes[selected].type);
    setBlockDescription(blockTypes[selected].description);
  }, [blockTypes]);

  return (
    <Grid
      columns={['auto', 'min-content']}
      rows={['min-content', 'auto', 'min-content']}
      gap="size-200"
      margin={0}
      width="100%" height="100%">
      <Flex direction="row" gap="size-200" alignItems={'end'} gridColumn='span 2'>
        <Picker
          label={getLabelWithOpenLink('Prompt Template', `${websiteUrl}/prompttemplates.json`)}
          isLoading={!promptTemplates}
          onSelectionChange={promptSelectionHandler}>
          {promptTemplates ? promptTemplates
            .map((template, index) => <Item key={index}>{template.label}</Item>) : []}
        </Picker>
        <Switch isSelected={sourceView} onChange={setSourceView}>Edit Mode</Switch>
      </Flex>
      <View UNSAFE_className={['editor-container', sourceView ? 'editable' : ''].join(' ')}>
        <SimpleEditor
          /* eslint-disable-next-line max-len */
          className="editor"
          value={renderPrompt(prompt, segment, blockType, blockDescription, customExpressions, variationCount, sourceView)}
          onValueChange={setPrompt}
          highlight={(code) => highlight(code, languages.custom, 'custom')}
          readOnly={!sourceView}
        />
      </View>
      <Flex direction="column" gap="size-200" alignItems="start">
        <Picker
          label={getLabelWithOpenLink('Block Type', `${websiteUrl}/${BLOCK_TYPES_FILENAME}`)}
          isLoading={!blockTypes}
          onSelectionChange={blockTypeSelectionHandler}>
          {blockTypes ? blockTypes
            .map((block, index) => <Item key={index}>{block.type}</Item>) : []}
        </Picker>
        <Picker
          label={getLabelWithOpenLink('Segments', `${websiteUrl}/${SEGMENTS_FILENAME}`)}
          isLoading={!segments}
          onSelectionChange={segmentSelectionHandler}>
          {segments ? segments
            .map((seg, index) => <Item key={index}>{seg.label}</Item>) : []}
        </Picker>
        {getCustomComponents(findCustomExpressions(prompt), customExpressions, setCustomExpressions)}
        <NumberField label="Number Of Variants" defaultValue={4} minValue={1} maxValue={4} onChange={setVariationCount} />
      </Flex>
      <Flex direction="row" gap="size-400" gridColumn='span 2' alignItems="center">
        <Button variant="primary" onPress={() => console.log(completionService.complete('prompt', 0.1))}>Generate</Button>
        <Slider
          label="Creativity"
          maxValue={1.0}
          step={0.001}
          formatOptions={{ style: 'percent', minimumFractionDigits: 1 }}
          defaultValue={0.1} />
      </Flex>
    </Grid>
  );
}

export default Editor;
