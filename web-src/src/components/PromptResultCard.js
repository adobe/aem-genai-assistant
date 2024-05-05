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
  Button, ActionButton, Tooltip, TooltipTrigger, Flex, ProgressCircle, Divider,
} from '@adobe/react-spectrum';
import React, {
  useCallback, useState, useEffect, useRef,
} from 'react';
import { css } from '@emotion/css';
import { motion } from 'framer-motion';
import { ToastQueue } from '@react-spectrum/toast';
import { useSetRecoilState } from 'recoil';
import { useIntl } from 'react-intl';

import { intlMessages } from './PromptResultCard.l10n.js';
import { useIsFavorite } from '../state/IsFavoriteHook.js';
import { useIsFeedback } from '../state/IsFeedbackHook.js';
import { useToggleFavorite } from '../state/ToggleFavoriteHook.js';
import { useSaveFeedback } from '../state/SaveFeedbackHook.js';
import { useApplicationContext } from './ApplicationProvider.js';
import { useShellContext } from './ShellProvider.js';
import { promptState } from '../state/PromptState.js';
import { parametersState } from '../state/ParametersState.js';
import { resultsState } from '../state/ResultsState.js';
import { useSaveResults } from '../state/SaveResultsHook.js';
import { useVariantImages } from '../state/VariantImagesHook.js';
import { sampleRUM } from '../rum.js';
import { log } from '../helpers/MetricsHelper.js';
import { toHTML, toText } from '../helpers/PromptExporter.js';
import { generateImagePrompt } from '../helpers/ImageHelper.js';
import { VariantImagesView } from './VariantImagesView.js';
import ExpressNoAccessInfo from './ExpressNoAccessInfo.js';

import RefreshIcon from '../icons/RefreshIcon.js';
import FavoritesIcon from '../icons/FavoritesIcon.js';
import FavoritesOutlineIcon from '../icons/FavoritesOutlineIcon.js';
import CopyOutlineIcon from '../icons/CopyOutlineIcon.js';
import DeleteOutlineIcon from '../icons/DeleteOutlineIcon.js';
import ThumbsUpOutlineIcon from '../icons/ThumbsUpOutlineIcon.js';
import ThumbsDownOutlineIcon from '../icons/ThumbsDownOutlineIcon.js';
import ThumbsUpDisabledIcon from '../icons/ThumbsUpDisabledIcon.js';
import ThumbsDownDisabledIcon from '../icons/ThumbsDownDisabledIcon.js';
import GenAIIcon from '../icons/GenAIIcon.js';

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
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    width: 300px;
    height: 100px;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid var(--palette-gray-300, #D9D9D9);
    background: var(--palette-gray-50, #FFF);
    user-select: none;
    overflow: hidden;
    &:hover {
      border-color: var(--alias-content-semantic-accent-default, #929292);
    }
    `,
  variantSelected: css`
    border-width: 2px;
    border-bottom-width: 5px;
    border-color: #0265DC;
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
  const { firefallService, expressSdkService } = useApplicationContext();
  const { isExpressAuthorized } = useShellContext();

  const [selectedVariant, setSelectedVariant] = useState(result.variants[0]);
  const [imagePromptProgress, setImagePromptProgress] = useState(false);
  const setPrompt = useSetRecoilState(promptState);
  const setParameters = useSetRecoilState(parametersState);
  const setResults = useSetRecoilState(resultsState);

  const isFavorite = useIsFavorite();
  const isFeedback = useIsFeedback();
  const toggleFavorite = useToggleFavorite();
  const saveFeedback = useSaveFeedback();
  const saveResults = useSaveResults();
  const { addImageToVariant } = useVariantImages();
  const resultsEndRef = useRef();
  const { formatMessage } = useIntl();

  useEffect(() => {
    if (resultsEndRef.current) {
      resultsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [setResults]);

  const sendFeedback = useCallback((sentiment) => {
    firefallService.feedback(result.id, sentiment)
      .then((id) => {
        ToastQueue.positive(formatMessage(intlMessages.promptResultCard.sendFeedbackSuccessToast), { timeout: 1000 });
      })
      .catch((error) => {
        ToastQueue.negative(error.message, { timeout: 1000 });
      });
  }, [result, firefallService]);

  const reusePrompt = useCallback(() => {
    setPrompt(result.promptTemplate);
    setParameters(result.parameters);
  }, [result, setPrompt, setParameters]);

  const deleteVariant = useCallback(async (variantId) => {
    log('prompt:delete', { variant: variantId });
    setResults((results) => results.reduce((acc, r) => {
      const prevVariantsLength = r.variants.length;
      const variants = r.variants.filter((v) => v.id !== variantId);
      const newVariantsLength = variants.length;
      console.debug('variants', variants);
      if (variants.length > 0) {
        acc.push({ ...r, variants });
        if (newVariantsLength < prevVariantsLength) {
          setSelectedVariant(variants[0]);
        }
        return acc;
      }
      return acc;
    }, []));
    await saveResults();
  }, [setResults]);

  const handleGenerateImage = useCallback(async (imagePrompt, variantId) => {
    log('express:generateimage', { variantId });
    const onPublish = (publishParams) => {
      addImageToVariant(variantId, publishParams.asset[0].data);
    };
    const onError = (err) => {
      console.error('Error:', err.toString());
      ToastQueue.negative(formatMessage(intlMessages.promptResultCard.generateImageFailedToast), { timeout: 2000 });
    };

    const success = await expressSdkService.handleImageOperation(
      'generateImage',
      {
        outputParams: {
          outputType: 'base64',
        },
        inputParams: {
          promptText: imagePrompt,
        },
        modalParams: {
          loadTimeout: 30000,
        },
        callbacks: {
          onPublish,
          onError,
        },
      },
    );

    if (!success) {
      ToastQueue.negative(formatMessage(intlMessages.promptResultCard.generateImageFailedToast), { timeout: 2000 });
    }
  }, [expressSdkService]);

  const handleGenerateImagePrompt = useCallback((variantId) => {
    setImagePromptProgress(true);
    generateImagePrompt(firefallService, selectedVariant)
      .then((imagePrompt) => {
        handleGenerateImage(imagePrompt, variantId);
      })
      .catch((error) => {
        ToastQueue.negative(error.message, { timeout: 2000 });
      })
      .finally(() => {
        setImagePromptProgress(false);
      });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'easeInOut', duration: 0.3 }}>
      <div {...props} className={styles.card} ref={resultsEndRef}>
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
              <Tooltip>{formatMessage(intlMessages.promptResultCard.reuseButtonTooltip)}</Tooltip>
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
            <Flex direction="row">
              <TooltipTrigger delay={0}>
                <ActionButton
                  isQuiet
                  UNSAFE_className="hover-cursor-pointer"
                  onPress={() => toggleFavorite(selectedVariant)}>
                  {isFavorite(selectedVariant) ? <FavoritesIcon /> : <FavoritesOutlineIcon />}
                </ActionButton>
                <Tooltip>{formatMessage(intlMessages.promptResultCard.favoriteButtonTooltip)}</Tooltip>
              </TooltipTrigger>
              <TooltipTrigger delay={0}>
                <ActionButton
                  isQuiet
                  UNSAFE_className="hover-cursor-pointer"
                  onPress={() => {
                    log('prompt:copy', { variant: selectedVariant.id });
                    sampleRUM('genai:prompt:copy', { source: 'ResultCard#onPress' });
                    navigator.clipboard.writeText(toText(selectedVariant.content));
                    ToastQueue.positive(
                      formatMessage(intlMessages.promptResultCard.copyTextSuccessToast),
                      { timeout: 1000 },
                    );
                  }}>
                  <CopyOutlineIcon />
                </ActionButton>
                <Tooltip>{formatMessage(intlMessages.promptResultCard.copyButtonTooltip)}</Tooltip>
              </TooltipTrigger>
              <TooltipTrigger delay={0}>
                <ActionButton
                  isQuiet
                  isDisabled={isFeedback(selectedVariant)}
                  UNSAFE_className="hover-cursor-pointer"
                  onPress={() => {
                    log('prompt:thumbsup', { variant: selectedVariant.id });
                    sampleRUM('genai:prompt:thumbsup', { source: 'ResultCard#onPress' });
                    sendFeedback(true);
                    saveFeedback(selectedVariant);
                  }}>
                  {isFeedback(selectedVariant) ? <ThumbsUpDisabledIcon /> : <ThumbsUpOutlineIcon />}
                </ActionButton>
                <Tooltip>{formatMessage(intlMessages.promptResultCard.goodButtonTooltip)}</Tooltip>
              </TooltipTrigger>
              <TooltipTrigger delay={0}>
                <ActionButton
                  isQuiet
                  isDisabled={isFeedback(selectedVariant)}
                  UNSAFE_className="hover-cursor-pointer"
                  onPress={() => {
                    log('prompt:thumbsdown', { variant: selectedVariant.id });
                    sampleRUM('genai:prompt:thumbsdown', { source: 'ResultCard#onPress' });
                    sendFeedback(false);
                    saveFeedback(selectedVariant);
                  }}>
                  {isFeedback(selectedVariant) ? <ThumbsDownDisabledIcon /> : <ThumbsDownOutlineIcon />}
                </ActionButton>
                <Tooltip>{formatMessage(intlMessages.promptResultCard.poorButtonTooltip)}</Tooltip>
              </TooltipTrigger>
              <TooltipTrigger delay={0}>
                <ActionButton
                  isQuiet
                  UNSAFE_className="hover-cursor-pointer"
                  onPress={() => deleteVariant(selectedVariant.id)}>
                  <DeleteOutlineIcon />
                </ActionButton>
                <Tooltip>{formatMessage(intlMessages.promptResultCard.removeButtonTooltip)}</Tooltip>
              </TooltipTrigger>
              <Divider size="S" orientation="vertical" marginStart={'size-100'} marginEnd={'size-100'} />
              <Flex direction="row" gap="size-100" alignItems={'center'}>
                <Button
                  UNSAFE_className="hover-cursor-pointer"
                  marginStart={'size-100'}
                  width="size-2000"
                  variant="secondary"
                  style="fill"
                  onPress={() => handleGenerateImagePrompt(selectedVariant.id)}
                  isDisabled={!isExpressAuthorized}>
                  {imagePromptProgress ? <ProgressCircle size="S" aria-label="Generate" isIndeterminate right="8px" /> : <GenAIIcon marginEnd={'8px'} />}
                  {formatMessage(intlMessages.promptResultCard.generateImageButtonLabel)}
                </Button>
                {!isExpressAuthorized && <ExpressNoAccessInfo />}
              </Flex>
            </Flex>
          </div>
          <VariantImagesView variant={selectedVariant} />
        </div>
      </div>
    </motion.div>
  );
}
