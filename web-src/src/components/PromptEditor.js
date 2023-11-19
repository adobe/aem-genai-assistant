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
import React, { useState } from 'react';
import { View } from '@adobe/react-spectrum';
/* eslint-disable-next-line import/no-named-default */
import { default as SimpleEditor } from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import { useRecoilState, useRecoilValue } from 'recoil';
import 'prismjs/themes/prism.css';
import { css } from '@emotion/css';
import { renderPrompt } from '../helpers/PromptRenderer.js';

import { promptState } from '../state/PromptState.js';
import { parametersState } from '../state/ParametersState.js';

languages.custom = {
  function: /{[^@#]([^{}]+)}/,
  keyword: /{@([^{}]+)}/,
  regex: /<please select>/,
  comment: /{#([^{}]+)}/,
};

const style = {
  container: css`
    width: 100%;
    height: 150px;
    position: relative;
    overflow: auto;
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 8px;
  `,
  editable: css`
    box-shadow: 
      0px -10px 20px -20px rgba(0,0,0,0.45),
      10px 0px 20px -20px rgba(0,0,0,0.45),
      0px 10px 20px -20px rgba(0,0,0,0.45),
      -10px 0px 20px -20px rgba(0,0,0,0.45);
    background-color: white;
    height: 500px;
  `,
  editor: css`
    color: var(--palette-gray-600, var(--palette-gray-600, #6D6D6D));
    font-family: Adobe Clean,serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 21px;
    position: absolute;
    & textarea:focus  {
      outline: none;
    }
  `,
};

function PromptEditor(props) {
  const [viewSource, setViewSource] = useState(false);
  const [prompt, setPrompt] = useRecoilState(promptState);
  const parameters = useRecoilValue(parametersState);

  return (
    <View
      {...props}
      UNSAFE_className={[style.container, viewSource && style.editable].join(' ')}>
      <SimpleEditor
        className={style.editor}
        onFocus={() => setViewSource(true)}
        onBlur={() => setViewSource(false)}
        value={viewSource ? prompt : renderPrompt(prompt, parameters)}
        onValueChange={setPrompt}
        highlight={(code) => highlight(code, languages.custom, 'custom')}
        readOnly={!viewSource}
      />
    </View>
  );
}

export default PromptEditor;
