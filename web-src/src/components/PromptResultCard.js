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
  ActionButton, Tooltip, TooltipTrigger,
} from '@adobe/react-spectrum';
import React, { useCallback, useState } from 'react';
import { css } from '@emotion/css';
import { ToastQueue } from '@react-spectrum/toast';
import { useSetRecoilState } from 'recoil';
import { useIsFavorite } from '../state/IsFavoriteHook.js';
import { useToggleFavorite } from '../state/ToggleFavoriteHook.js';
import { useApplicationContext } from './ApplicationProvider.js';
import { promptState } from '../state/PromptState.js';
import { parametersState } from '../state/ParametersState.js';
import { resultsState } from '../state/ResultsState.js';
import { useSaveResults } from '../state/SaveResultsHook.js';
import { toClipboard, toHTML } from '../helpers/PromptExporter.js';
import { tracking } from '../helpers/Tracking.js';

import RefreshIcon from '../icons/RefreshIcon.js';
import FavoritesIcon from '../icons/FavoritesIcon.js';
import FavoritesOutlineIcon from '../icons/FavoritesOutlineIcon.js';
import CopyOutlineIcon from '../icons/CopyOutlineIcon.js';
import DeleteOutlineIcon from '../icons/DeleteOutlineIcon.js';
import ThumbsUpOutlineIcon from '../icons/ThumbsUpOutlineIcon.js';
import ThumbsDownOutlineIcon from '../icons/ThumbsDownOutlineIcon.js';

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

export function PromptResultCard({ result, ...props }) {
  const { firefallService } = useApplicationContext();
  const [selectedVariant, setSelectedVariant] = useState(result.variants[0]);
  const setPrompt = useSetRecoilState(promptState);
  const setParameters = useSetRecoilState(parametersState);
  const setResults = useSetRecoilState(resultsState);
  const isFavorite = useIsFavorite();
  const toggleFavorite = useToggleFavorite();
  const saveResults = useSaveResults();

  const sendFeedback = useCallback((sentiment) => {
    firefallService.feedback(result.id, sentiment)
      .then((id) => {
        ToastQueue.positive('Feedback sent', { timeout: 1000 });
      })
      .catch((error) => {
        ToastQueue.negative('Failed to send feedback. Error code: IS-ERROR', { timeout: 1000 });
      });
  }, [result, firefallService]);

  const reusePrompt = useCallback(() => {
    setPrompt(result.promptTemplate);
    setParameters(result.parameters);
  }, [result, setPrompt, setParameters]);

  const deleteVariant = useCallback(async (variantId) => {
    console.debug('deleteVariant', variantId);
    setResults((results) => results.reduce((acc, r) => {
      const variants = r.variants.filter((v) => v.id !== variantId);
      console.debug('variants', variants);
      if (variants.length > 0) {
        acc.push({ ...r, variants });
        return acc;
      }
      return acc;
    }, []));
    await saveResults();
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
              onPress={reusePrompt}>
              <RefreshIcon />
            </ActionButton>
            <Tooltip>Re-use</Tooltip>
          </TooltipTrigger>
        </div>
      </div>
      <div className={styles.resultsSection}>
        <div className={styles.variantsContainer}>
          {
            result.variants.map((variant) => {
              return (
                <a key={variant.id} onClick={() => setSelectedVariant(variant)}>
                  <div className={css`
                    ${styles.variant};
                    ${variant.id === selectedVariant.id && styles.variantSelected};
                    ${isFavorite(variant) && styles.variantFavorite};
                  `}
                    dangerouslySetInnerHTML={{ __html: toHTML(variant.content) }} />
                </a>
              );
            })
          }
        </div>
        <div className={styles.resultContent} dangerouslySetInnerHTML={{ __html: toHTML(selectedVariant.content) }} />
        <div className={styles.resultActions}>
          <TooltipTrigger delay={0}>
            <ActionButton
              isQuiet
              UNSAFE_className="hover-cursor-pointer"
              onPress={() => toggleFavorite(selectedVariant)}>
              {isFavorite(selectedVariant) ? <FavoritesIcon /> : <FavoritesOutlineIcon />}
            </ActionButton>
            <Tooltip>Favorite</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0}>
            <ActionButton
              isQuiet
              UNSAFE_className="hover-cursor-pointer"
              onPress={() => {
                tracking('genai:prompt:copy', { source: 'ResultCard#onPress' });
                navigator.clipboard.write(toClipboard(toHTML(selectedVariant.content)));
                ToastQueue.positive('Copied to clipboard', { timeout: 1000 });
              }}>
              <CopyOutlineIcon />
            </ActionButton>
            <Tooltip>Copy</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0}>
            <ActionButton
              isQuiet
              UNSAFE_className="hover-cursor-pointer"
              onPress={() => {
                tracking('genai:prompt:thumbsup', { source: 'ResultCard#onPress' });
                sendFeedback(true);
              }}>
              <ThumbsUpOutlineIcon />
            </ActionButton>
            <Tooltip>Good</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0}>
            <ActionButton
              isQuiet
              UNSAFE_className="hover-cursor-pointer"
              onPress={() => {
                tracking('genai:prompt:thumbsdown', { source: 'ResultCard#onPress' });
                sendFeedback(false);
              }}>
              <ThumbsDownOutlineIcon />
            </ActionButton>
            <Tooltip>Poor</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0}>
            <ActionButton
              isQuiet
              UNSAFE_className="hover-cursor-pointer"
              onPress={() => deleteVariant(selectedVariant.id)}>
              <DeleteOutlineIcon />
            </ActionButton>
            <Tooltip>Remove</Tooltip>
          </TooltipTrigger>
        </div>
      </div>
    </div>
  );
}
