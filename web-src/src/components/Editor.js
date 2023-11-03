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
  Item, Button, Grid, Picker, Flex, Switch, Slider, View,
} from '@adobe/react-spectrum';
/* eslint-disable-next-line import/no-named-default */
import { default as SimpleEditor } from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import { useApplicationContext } from './ApplicationProvider.js';
import { ParametersView } from './ParametersView.js';
import 'prismjs/themes/prism.css';
import { LinkLabel } from './LinkLabel.js';
import { EXPRESSION_REGEX, parseSpreadSheet, parseExpressions } from '../helpers/ParsingHelpers.js';

const PROMPT_TEMPLATES_FILENAME = 'prompttemplates.json';

const CREATIVITY_LABELS = [
  'Conventional',
  'Balanced',
  'Innovator',
  'Visionary',
];

languages.custom = {
  function: /\{[^}]+}/g,
  variable: /<please select>/,
};

function isBlankExpressionValue(value) {
  if (typeof value === 'number') {
    return false;
  } else if (typeof value === 'string') {
    return value.trim() === '';
  }
  return value === null || value === undefined;
}

function replaceTemplateStrings(str, valuesMap) {
  return str.replace(EXPRESSION_REGEX, (match, key) => {
    /* eslint-disable-next-line no-nested-ternary */
    return key in valuesMap
      ? (isBlankExpressionValue(valuesMap[key]) ? '<please select>' : valuesMap[key])
      : '<please select>';
  });
}

function renderPrompt(prompt, expressions, sourceView) {
  return sourceView ? prompt : replaceTemplateStrings(prompt, expressions);
}

function Editor({ setResults }) {
  const { websiteUrl, completionService } = useApplicationContext();

  const [promptTemplates, setPromptTemplates] = React.useState([]);
  const [parameters, setParameters] = React.useState([]);
  const [showPrompt, setShowPrompt] = React.useState(true);
  const [sourceView, setSourceView] = React.useState(false);
  const [prompt, setPrompt] = React.useState('');
  const [temperature, setTemperature] = React.useState(0.30);
  const [busy, setBusy] = React.useState(false);

  useEffect(() => {
    parseSpreadSheet(`${websiteUrl}/${PROMPT_TEMPLATES_FILENAME}`).then(setPromptTemplates);
  }, []);

  const promptSelectionHandler = useCallback((selected) => {
    setPrompt(promptTemplates[selected].value);
    setSourceView(false);
  }, [promptTemplates]);

  const completionHandler = useCallback(() => {
    setBusy(true);
    const finalPrompt = renderPrompt(
      prompt,
      parameters,

      sourceView,
    );
    completionService.complete(finalPrompt, temperature)
      .then((result) => {
        try {
          setResults(JSON.parse(result));
        } catch (error) {
          setResults([result]);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setBusy(false);
      });
  }, [completionService, prompt, temperature, parameters]);

  const expressions = parseExpressions(prompt);

  return (
    <Grid
      columns={['auto', 'minmax(0, min-content)']}
      rows={['65px', 'auto', '65px']}
      gap="size-200"
      margin={0}
      width="100%" height="100%">
      <Flex direction="row" gap="size-200" alignItems={'end'} gridColumn='span 2'>
        <Picker
          label={<LinkLabel label="Prompt Library" url={`${websiteUrl}/${PROMPT_TEMPLATES_FILENAME}`}/>}
          isLoading={!promptTemplates}
          onSelectionChange={promptSelectionHandler}
          width="35%">
          {promptTemplates ? promptTemplates
            .map((template, index) => <Item key={index}>{template.key}</Item>) : []}
        </Picker>
        <Switch isSelected={showPrompt} onChange={setShowPrompt}>Show Prompt</Switch>
        <Switch isSelected={sourceView} onChange={setSourceView} isDisabled={!showPrompt}>Edit Mode</Switch>
      </Flex>
      <View UNSAFE_style={{ display: showPrompt ? 'block' : 'none' }}
            UNSAFE_className={['editor-container', sourceView ? 'editable' : ''].join(' ')}>
        <SimpleEditor
          className="editor"
          value={renderPrompt(prompt, parameters, sourceView)}
          onValueChange={setPrompt}
          highlight={(code) => highlight(code, languages.custom, 'custom')}
          readOnly={!sourceView}
        />
      </View>
      <Flex
        direction="column"
        gap="size-200"
        alignItems="start"
        width={Object.keys(expressions).length ? (showPrompt ? '200px' : '80%') : 0}>
        <ParametersView expressions={expressions} state={parameters} setState={setParameters} />
      </Flex>
      <Flex direction="row" gap="size-400" gridColumn='span 2' alignItems="center">
        <Button variant="primary" onPress={completionHandler} isDisabled={busy}>Generate</Button>
        <Slider
          label="Creativity"
          minValue={0.0}
          maxValue={0.9}
          step={0.30}
          getValueLabel={(value) => CREATIVITY_LABELS[value / 0.30]}
          onChange={setTemperature}
          defaultValue={temperature} />
      </Flex>
    </Grid>
  );
}

export default Editor;
