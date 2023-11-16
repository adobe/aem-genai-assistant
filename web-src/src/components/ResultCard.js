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
  ActionButton, Image, Tooltip, TooltipTrigger,
} from '@adobe/react-spectrum';
import ThumbUp from '@spectrum-icons/workflow/ThumbUp';
import ThumbDown from '@spectrum-icons/workflow/ThumbDown';
import Star from '@spectrum-icons/workflow/Star';
import StarOutline from '@spectrum-icons/workflow/StarOutline';
import Copy from '@spectrum-icons/workflow/Copy';
import Delete from '@spectrum-icons/workflow/Delete';
import React, { useCallback, useState } from 'react';
import { css } from '@emotion/css';
import { ToastQueue } from '@react-spectrum/toast';
import { useSetRecoilState } from 'recoil';
import { useIsFavorite } from '../state/IsFavoriteHook.js';
import { useToggleFavorite } from '../state/ToggleFavoriteHook.js';
import { useApplicationContext } from './ApplicationProvider.js';
import ReusePromptIcon from '../assets/reuse-prompt.svg';
import { promptState } from '../state/PromptState.js';
import { parametersState } from '../state/ParametersState.js';
import { resultsState } from '../state/ResultsState.js';
import { useSaveSession } from '../state/SaveSessionHook.js';

const styles = {
  card: css`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    margin: 0 16px;
  `,
  promptSection: css`
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: start;
  `,
  promptContent: css`
    --max-lines: 3;
    --line-height: 1.4;
    max-height: calc(var(--max-lines) * 1em * var(--line-height));
    line-height: var(--line-height);
    overflow: hidden;
    color: var(--alias-content-neutral-subdued-default, var(--alias-content-neutral-subdued-default, #464646));
    font-family: Adobe Clean, serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    position: relative;
    ::before {
      content: "";
      position: absolute;
      height: calc(1em * var(--line-height));
      width: 100%;
      bottom: 0;
      pointer-events: none;
      background: linear-gradient(to bottom, transparent, white);
    }
  `,
  promptActions: css`
  `,
  resultsSection: css`
    display: flex;
    padding: 16px;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    gap: 16px;
    border-radius: 8px;
    border: 2px solid var(--palette-gray-200, #E6E6E6);
    background: var(--palette-gray-50, #FFF);
  `,
  variantsContainer: css`
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: left;
    width: 100%;
    overflow: auto;
    padding: 10px;
  `,
  variant: css`
    width: 300px;
    height: 100px;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid var(--palette-gray-300, #D5D5D5);
    background: var(--palette-gray-50, #FFF);
    user-select: none;
    overflow: hidden;
    &:hover {
      border-color: var(--alias-content-semantic-accent-default, #0265DC);
    }
    `,
  variantSelected: css`
    border-bottom-width: 5px;
    `,
  variantFavorite: css`
    background-color: #fffff0;
  `,
  resultContent: css`
  `,
  resultActions: css`
  `,
};

export function ResultCard({ result, ...props }) {
  const variants = (!Array.isArray(result.variants)) ? [result.variants] : result.variants;
  const { firefallService } = useApplicationContext();
  const [selectedVariant, setSelectedVariant] = useState(variants);
  const setPrompt = useSetRecoilState(promptState);
  const setParameters = useSetRecoilState(parametersState);
  const setResults = useSetRecoilState(resultsState);
  const isFavorite = useIsFavorite();
  const toggleFavorite = useToggleFavorite();
  const saveSession = useSaveSession();

  const sendFeedback = useCallback((sentiment) => {
    firefallService.feedback(result.resultId, sentiment)
      .then((id) => {
        console.log('Feedback sent', id);
        ToastQueue.positive('Feedback sent', { timeout: 1000 });
      })
      .catch((error) => {
        console.error('Failed to send feedback', error);
        ToastQueue.negative('Failed to send feedback', { timeout: 1000 });
      });
  }, [result, firefallService]);

  const reusePrompt = useCallback(() => {
    setPrompt(result.promptTemplate);
    setParameters(result.parameters);
  }, [result, setPrompt, setParameters]);

  const deleteResult = useCallback(async (resultId) => {
    setResults((results) => results.filter((result) => result.resultId !== resultId));
    await saveSession();
  }, [setResults]);

  return (
    <div {...props} className={styles.card}>

      <div className={styles.promptSection}>
        <div className={styles.promptContent}>{result.prompt}</div>
        <div className={styles.promptActions}>
          <TooltipTrigger delay={0}>
            <ActionButton
              isQuiet
              UNSAFE_className="hover-cursor-pointer"
              onPress={() => navigator.clipboard.writeText(result.prompt)}>
              <Copy/>
            </ActionButton>
            <Tooltip>Copy</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0}>
            <ActionButton
              isQuiet
              UNSAFE_className="hover-cursor-pointer"
              onPress={reusePrompt}>
              <Image src={ReusePromptIcon} />
            </ActionButton>
            <Tooltip>Re-use</Tooltip>
          </TooltipTrigger>
        </div>
      </div>
      <div className={styles.resultsSection}>
        <div className={styles.variantsContainer}>
          {
            variants.map((variant) => {
              return (
                // eslint-disable-next-line react/jsx-key
                <a onClick={() => setSelectedVariant(variant)}>
                  <div className={css`
                    ${styles.variant};
                    ${variant.id === selectedVariant.id && styles.variantSelected};
                    ${isFavorite(variant) && styles.variantFavorite};
                  `}
                   dangerouslySetInnerHTML={{ __html: variant.content }} />
                </a>
              );
            })
          }
        </div>
        <div className={styles.resultContent} dangerouslySetInnerHTML={{ __html: selectedVariant.content }}/>
        <div className={styles.resultActions}>
          <TooltipTrigger delay={0}>
            <ActionButton
              isQuiet
              UNSAFE_className="hover-cursor-pointer"
              onPress={() => toggleFavorite(selectedVariant)}>
              {isFavorite(selectedVariant) ? <StarOutline/> : <Star/>}
            </ActionButton>
            <Tooltip>Save</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0}>
            <ActionButton
              isQuiet
              UNSAFE_className="hover-cursor-pointer"
              onPress={() => navigator.clipboard.writeText(selectedVariant.content)}>
              <Copy/>
            </ActionButton>
            <Tooltip>Copy</Tooltip>
          </TooltipTrigger>
          <ActionButton
            isQuiet
            UNSAFE_className="hover-cursor-pointer"
            onPress={() => sendFeedback(true)}>
            <ThumbUp/>
          </ActionButton>
          <ActionButton
            isQuiet
            UNSAFE_className="hover-cursor-pointer"
            onPress={() => sendFeedback(false)}>
            <ThumbDown/>
          </ActionButton>
          <TooltipTrigger delay={0}>
            <ActionButton
              isQuiet
              UNSAFE_className="hover-cursor-pointer"
              onPress={() => deleteResult(result.resultId)}>
              <Delete/>
            </ActionButton>
            <Tooltip>Remove</Tooltip>
          </TooltipTrigger>
        </div>
      </div>
    </div>
  );
}
