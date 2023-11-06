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
  Item, Button, Grid, Picker, Flex, Switch, Slider, View, Badge, Text,
} from '@adobe/react-spectrum';
/* eslint-disable-next-line import/no-named-default */
import { default as SimpleEditor } from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import InfoIcon from '@spectrum-icons/workflow/InfoOutline';
import GenerateIcon from '@spectrum-icons/workflow/MagicWand';
import { useApplicationContext } from './ApplicationProvider.js';
import { ParametersView } from './ParametersView.js';
import 'prismjs/themes/prism.css';
import { LinkLabel } from './LinkLabel.js';
import {
  EXPRESSION_REGEX,
  parseExpressions,
} from '../helpers/ExpressionParser.js';
import { parseSpreadSheet } from '../helpers/SpreadsheetParser.js';
import { renderExpressions } from '../helpers/ExpressionRenderer.js';

const PROMPT_TEMPLATES_FILENAME = 'prompttemplates.json';

const CREATIVITY_LABELS = [
  'Conventional',
  'Balanced',
  'Innovator',
  'Visionary',
];

languages.custom = {
  function: /{[^@#]([^{}]+)}/,
  keyword: /{@([^{}]+)}/,
  regex: /<please select>/,
  comment: /{#([^{}]+)}/,
};

function Editor({ setResults }) {
  const { appVersion, websiteUrl, completionService } = useApplicationContext();

  const [promptTemplates, setPromptTemplates] = React.useState([]);
  const [parameters, setParameters] = React.useState([]);
  const [showPrompt, setShowPrompt] = React.useState(true);
  const [sourceView, setSourceView] = React.useState(false);
  const [prompt, setPrompt] = React.useState('');
  const [temperature, setTemperature] = React.useState(0.30);
  const [pending, setPending] = React.useState(false);

  useEffect(() => {
    parseSpreadSheet(`${websiteUrl}/${PROMPT_TEMPLATES_FILENAME}`).then(setPromptTemplates);
  }, []);

  const promptSelectionHandler = useCallback((selected) => {
    setPrompt(promptTemplates[selected].value);
    setSourceView(false);
  }, [promptTemplates]);

  const completionHandler = useCallback(() => {
    setPending(true);
    const finalPrompt = sourceView ? prompt : renderExpressions(prompt, parameters);
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
        setPending(false);
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
          value={sourceView ? prompt : renderExpressions(prompt, parameters)}
          onValueChange={setPrompt}
          highlight={(code) => highlight(code, languages.custom, 'custom')}
          readOnly={!sourceView}
        />
      </View>
      <Flex
        direction="column"
        gap="size-200"
        alignItems="start"
        width={Object.keys(expressions).length ? (showPrompt ? '200px' : '100%') : 0}
        UNSAFE_style={{
          overflow: 'scroll',
        }}>
        <ParametersView expressions={expressions} state={parameters} setState={setParameters} />
      </Flex>
      <Flex direction="row" gap="size-400" gridColumn='span 2' alignItems="center">
        <Button variant="primary" isPending={pending} onPress={completionHandler} isDisabled={pending}>
          <GenerateIcon/>
          <Text>Generate</Text>
        </Button>
        <Slider
          label="Creativity"
          minValue={0.0}
          maxValue={0.9}
          step={0.30}
          getValueLabel={(value) => CREATIVITY_LABELS[value / 0.30]}
          onChange={setTemperature}
          defaultValue={temperature} />
        <Badge variant="neutral">v{appVersion}</Badge>
      </Flex>
    </Grid>
  );
}

export default Editor;
