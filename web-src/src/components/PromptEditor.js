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
import {
  ActionButton, Flex, Text, Content, ContextualHelp,
} from '@adobe/react-spectrum';
import React, { useEffect, useState, useCallback } from 'react';
/* eslint-disable-next-line import/no-named-default */
import { default as SimpleEditor } from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import { useRecoilState, useRecoilValue } from 'recoil';
import { css, injectGlobal } from '@emotion/css';
import { Global } from '@emotion/react';
import { motion, AnimatePresence } from 'framer-motion';
import Close from '@spectrum-icons/workflow/Close';

import { parametersState } from '../state/ParametersState.js';
import { promptState } from '../state/PromptState.js';
import { NO_VALUE_STRING, renderPrompt } from '../helpers/PromptRenderer.js';
import { log } from '../helpers/MetricsHelper.js';

import PreviewIcon from '../icons/PreviewIcon.js';
import { contentFragmentState } from '../state/ContentFragmentState.js';

languages.custom = {
  function: /{{[^@#]([^{}]+)}}/,
  keyword: /{{@([^{}]+)}}/,
  comment: /{{#([^{}]+)}}/,
  regex: new RegExp(`${NO_VALUE_STRING}`),
};

const style = {
  frame: css`
    display: flex;
    flex-direction: column;
    width: 90%;
    height: 100%;
    border-right: 1px solid var(--spectrum-gray-200);
    padding: 10px;
    padding-right: 34px;
    padding-bottom: 34px;
    overflow: 'auto';
    position: absolute;
    background-color: white;
    box-shadow: 2px 0px 3px 0px rgba(0, 0, 0, 0.12);
    &:focus {
      outline: none;
    }
  `,
  title: css`
    font-size: 14px;
    font-weight: 700;
  `,
  editable: css`
    background-color: white;
    height: 500px;
    border: 2px solid #ccc;
  `,
  container: css`
    width: 100%;
    height: 100%;
    position: relative; 
    overflow: auto;
    border: 1px solid var(--spectrum-gray-500);
    border-radius: 4px;
    padding: 12px;
  `,
  editor: css`
    font-family: Monospaced, monospace;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 21px;
    position: absolute;
  `,
  textarea: css`
    outline: none;
  `,
};

function PromptEditor({ isOpen, onClose, ...props }) {
  const [prompt, setPrompt] = useRecoilState(promptState);
  const [promptText, setPromptText] = useState(prompt);
  const [viewSource, setViewSource] = useState(false);
  const parameters = useRecoilValue(parametersState);
  const contentFragment = useRecoilValue(contentFragmentState);

  useEffect(() => {
    setPrompt(promptText);
    const promptEditorTextArea = document.getElementById('promptEditorTextArea');
    if (promptEditorTextArea) {
      promptEditorTextArea.setAttribute('title', 'Prompt Editor');
    }
  }, [promptText, setPrompt]);

  useEffect(() => {
    setPromptText(prompt);
  }, [prompt, setPromptText]);

  useEffect(() => {
    if (viewSource) {
      const textarea = document.getElementById('promptEditorTextArea');
      textarea.setSelectionRange(0, 0);
    }
  }, [viewSource]);

  useEffect(() => {
    if (!viewSource) {
      log('prompt:editor:previewed');
    }
  }, [viewSource]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div {...props}
          className={[style.frame, viewSource && style.editable].join(' ')}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0, transition: { type: 'easeInOut', duration: 0.2 } }}
          exit={{ opacity: 0, x: -20, transition: { type: 'easeOut', duration: 0.1 } }}>
          <Global styles={injectGlobal`
        .token.regex {
          font-weight: bold !important;
          color: #0095ff !important;
        }
        .token.function {
          color: #0095ff !important;
        }
        .token.keyword {
          color: #b25b5b !important;
        }
        .token.comment {
          color: #8a8a8a !important;
        }
      `} />
          <Flex direction="row" justifyContent="space-between" alignItems="center" marginTop="15px" marginBottom="15px">
            <Flex direction="row" gap="size-100">
              <Text UNSAFE_className={style.title}>Prompt and Trusted Source Documents</Text>
              <ContextualHelp variant="info">
                <Content>
                  When editing the prompt directly, include specific context, which can include your branding materials,
                  website content, data schemas for such data, templates, and other trusted documents.
                </Content>
              </ContextualHelp>
            </Flex>
            <Flex direction="row" gap="size-100">
              <ActionButton
                isQuiet
                UNSAFE_className="hover-cursor-pointer"
                onPress={() => setViewSource(!viewSource)}
                UNSAFE_style={!viewSource ? { background: 'var(--spectrum-gray-200)' } : undefined}
              >
                <PreviewIcon />
                <Text>Preview</Text>
              </ActionButton>
              <ActionButton isQuiet onPress={onClose}>
                <Close />
              </ActionButton>
            </Flex>
          </Flex>

          <div className={style.container}>
            <SimpleEditor
              className={style.editor}
              textareaClassName={style.textarea}
              textareaId={'promptEditorTextArea'}
              onFocus={() => setViewSource(true)}
              onKeyDown={handleKeyDown}
              autoFocus={true}
              value={viewSource ? promptText : renderPrompt(promptText, parameters, contentFragment?.model)}
              onValueChange={setPromptText}
              highlight={(code) => highlight(code, languages.custom, 'custom')}
              style={{ minHeight: '100%' }}
              readOnly={!viewSource}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PromptEditor;
