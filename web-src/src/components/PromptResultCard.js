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
  Button, ActionButton, Tooltip, TooltipTrigger, Flex, ProgressCircle, Divider, Text, Heading,
} from '@adobe/react-spectrum';
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { css } from '@emotion/css';
import { motion } from 'framer-motion';
import { ToastQueue } from '@react-spectrum/toast';
import { useSetRecoilState } from 'recoil';
import { useIntl } from 'react-intl';

import Slider from 'react-slick';
import { intlMessages } from './PromptResultCard.l10n.js';
import { intlMessages as appIntlMessages } from './App.l10n.js';
import { EXPRESS_LOAD_TIMEOUT } from './Constants.js';

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
import { log, analytics } from '../helpers/MetricsHelper.js';
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
import { ContentFragmentExportButton } from './ContentFragmentExportButton.js';
import { RUN_MODE_CF } from '../state/RunMode.js';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { handleLocalizedResponse, extractL10nId } from '../helpers/FormatHelper.js';

const styles = {
  card: css`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    margin: 0 16px;
  `,
  promptSection: css`
  `,
  promptContent: css`
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
    flex-direction: row;
    gap: 10px;
    align-items: center;
    width: 100%;
    padding-left: 10px;
    overflow: hidden;
    position: relative;
  `,
  variantLink: css`
    cursor: pointer;
    display: flex;
    justify-content: center;
    `,

  variant: css`
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    align-self: center;
    max-width: 95%;
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
  resultMetadata: css`
    color: var(--alias-content-semantic-neutral-subdued-default, #929292);
    font-size: 12px;
  `,
  resultActions: css`
    & div {
      font-size: 12px;
      color: var(--alias-content-semantic-neutral-subdued-default, #929292);
    }
  `,
};

export function extractMetadataFields(obj) {
  const isObject = (o) => typeof o === 'object' && !Array.isArray(o) && o !== null;
  if (!isObject(obj)) {
    return {};
  }

  const resultFields = { ...obj };
  const metadataFields = {};

  const aiRationaleRegex = /^ai[_\s]*rationale$/i;
  const variationNameRegex = /^variation[_\s]*name$/i;

  for (const key of Object.keys(obj)) {
    if (aiRationaleRegex.test(key)) {
      metadataFields.aiRationale = obj[key];
      delete resultFields[key];
    } else if (variationNameRegex.test(key)) {
      metadataFields.variationName = obj[key];
      delete resultFields[key];
    }
  }

  return { resultFields, metadataFields };
}

export function PromptResultCard({ result, ...props }) {
  const {
    runMode, firefallService, expressSdkService,
  } = useApplicationContext();

  const { isExpressAuthorized, user } = useShellContext();

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

  /** @see for more details https://react-slick.neostack.com/docs/example/multiple-items */
  const variationCarouselSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
  };

  useEffect(() => {
    if (resultsEndRef.current) {
      resultsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [setResults]);

  const sendFeedback = useCallback((sentiment, variant) => {
    firefallService.feedback(result.id, sentiment)
      .then((id) => {
        saveFeedback(variant);
        ToastQueue.positive(formatMessage(intlMessages.promptResultCard.sendFeedbackSuccessToast), { timeout: 1000 });
      })
      .catch((error) => {
        const errorL10nId = extractL10nId(error.message);
        let errorMessage;

        if (errorL10nId) {
          const localizedErrorMsg = formatMessage(appIntlMessages.app[errorL10nId]);
          errorMessage = handleLocalizedResponse(error.message, localizedErrorMsg);
        } else {
          errorMessage = error.message;
        }

        ToastQueue.negative(errorMessage, { timeout: 1000 });
      });
  }, [result, firefallService]);

  const formattedTimestamp = new Date(result.timestamp).toLocaleString(user.locale, {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  const reusePrompt = useCallback(() => {
    setPrompt(result.promptTemplate);
    setParameters(result.parameters);
  }, [result, setPrompt, setParameters]);

  const deleteVariant = useCallback(async (variantId) => {
    const logRecords = { variant: variantId };
    log('prompt:delete', logRecords);
    analytics({
      widget: {
        name: 'Prompt Template',
        type: 'NA',
      },
      element: 'Delete Variation',
      elementId: 'prompt:delete',
      type: 'button',
      action: 'click',
    }, logRecords);
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
    const logRecords = { variantId };
    log('express:generateimage', logRecords);
    analytics({
      widget: {
        name: 'Prompt Template',
        type: 'NA',
      },
      element: 'Generate Image',
      elementId: 'express:generateimage',
      type: 'button',
      action: 'click',
    }, logRecords);
    const onPublish = (intent, publishParams) => {
      console.log('Image generated:', publishParams.asset[0].data);
      addImageToVariant(variantId, publishParams.asset[0].data);
    };
    const onError = (err) => {
      console.error('Error:', err.toString());
      ToastQueue.negative(formatMessage(intlMessages.promptResultCard.generateImageFailedToast), { timeout: 2000 });
    };

    const success = await expressSdkService.handleImageOperation(
      'generateImage',
      {
        appConfig: {
          callbacks: {
            onPublish,
            onError,
          },
          metaData: {},
          promptText: imagePrompt,
        },
        exportConfig: [],
        containerConfig: {
          loadTimeout: EXPRESS_LOAD_TIMEOUT.GENERATE_IMAGE,
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
        const errorL10nId = extractL10nId(error.message);
        let errorMessage;

        if (errorL10nId) {
          const localizedErrorMsg = formatMessage(appIntlMessages.app[errorL10nId]);
          errorMessage = handleLocalizedResponse(error.message, localizedErrorMsg);
        } else {
          errorMessage = error.message;
        }

        ToastQueue.negative(errorMessage, { timeout: 2000 });
      })
      .finally(() => {
        setImagePromptProgress(false);
      });
  }, []);

  const { resultFields, metadataFields } = extractMetadataFields(selectedVariant.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'easeInOut', duration: 0.3 }}>
      <div {...props} className={styles.card} ref={resultsEndRef}>
        <div className={styles.resultsSection}>
          <Flex justifyContent="space-between" alignItems="center" width={'100%'} UNSAFE_style={{ paddingRight: '8px' }}>
            <TooltipTrigger delay={0}>
              <ActionButton
                  isQuiet
                  UNSAFE_className="hover-cursor-pointer"
                  onPress={reusePrompt}>
                <RefreshIcon />
                <Text>{formatMessage(intlMessages.promptResultCard.reuseButtonLabel)}</Text>
              </ActionButton>
              <Tooltip>{formatMessage(intlMessages.promptResultCard.reuseButtonTooltip)}</Tooltip>
            </TooltipTrigger>
            <Text>{formattedTimestamp}</Text>
          </Flex>
          <Divider size="S" marginStart={'size-100'} marginEnd={'size-100'}/>
          <div className={styles.variantsContainer}>
            <Heading level={3}>{formatMessage(intlMessages.promptResultCard.variationsHeading)}</Heading>
            <Slider {...variationCarouselSettings} >
            {
              result.variants.map((variant) => {
                return (
                    <a key={variant.id} onClick={() => setSelectedVariant(variant)} className={styles.variantLink}>
                      <div className={css`
                        ${styles.variant};
                        ${variant.id === selectedVariant.id && styles.variantSelected};
                        ${isFavorite(variant) && styles.variantFavorite};
                      `}
                           dangerouslySetInnerHTML={{ __html: toHTML(variant.content) }}/>
                    </a>
                );
              })
            }
            </Slider>
          </div>
            {resultFields
              && <div className={styles.resultContent} dangerouslySetInnerHTML={{ __html: toHTML(resultFields) }} />
            }
            {metadataFields
              && <div className={styles.resultMetadata} dangerouslySetInnerHTML={{ __html: toHTML(metadataFields) }} />
            }
          <Flex direction="row" justifyContent={'space-between'} width={'100%'}>
            <Flex>
                {runMode !== RUN_MODE_CF
                    && <TooltipTrigger delay={0}>
                <ActionButton
                    isQuiet
                    UNSAFE_className="hover-cursor-pointer"
                    onPress={() => toggleFavorite(selectedVariant)}>
                  {isFavorite(selectedVariant) ? <FavoritesIcon/> : <FavoritesOutlineIcon/>}
                </ActionButton>
                <Tooltip>{formatMessage(intlMessages.promptResultCard.favoriteButtonTooltip)}</Tooltip>
              </TooltipTrigger>
                }
              <TooltipTrigger delay={0}>
                <ActionButton
                  isQuiet
                  UNSAFE_className="hover-cursor-pointer"
                  onPress={() => {
                    const logRecords = { source: 'ResultCard#onPress', variant: selectedVariant.id };
                    log('prompt:copy', logRecords);
                    analytics({
                      widget: {
                        name: 'Prompt Template',
                        type: 'NA',
                      },
                      element: 'Copy Variation',
                      elementId: 'prompt:copy',
                      type: 'button',
                      action: 'click',
                    }, logRecords);
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
                {runMode !== RUN_MODE_CF
                    && <TooltipTrigger delay={0}>
                <ActionButton
                    isQuiet
                    UNSAFE_className="hover-cursor-pointer"
                    onPress={() => deleteVariant(selectedVariant.id)}>
                  <DeleteOutlineIcon/>
                </ActionButton>
                <Tooltip>{formatMessage(intlMessages.promptResultCard.removeButtonTooltip)}</Tooltip>
              </TooltipTrigger>
                }
                {runMode === RUN_MODE_CF
                    && <>
                        <Divider size="S" orientation="vertical" marginStart={'size-100'} marginEnd={'size-100'}/>
                        <ContentFragmentExportButton variant={selectedVariant}/>
                    </>
                }
              <Divider size="S" orientation="vertical" marginStart={'size-100'} marginEnd={'size-100'}/>
              <Flex direction="row" gap="size-100" alignItems={'center'}>
                <Button
                    UNSAFE_className="hover-cursor-pointer"
                    marginStart={'size-100'}
                    width="size-2000"
                    variant="secondary"
                    style="fill"
                    onPress={() => handleGenerateImagePrompt(selectedVariant.id)}
                    isDisabled={!isExpressAuthorized}>
                  {imagePromptProgress ? <ProgressCircle size="S" aria-label="Generate" isIndeterminate right="8px"/>
                    : <GenAIIcon marginEnd={'8px'}/>}
                  {formatMessage(intlMessages.promptResultCard.generateImageButtonLabel)}
                </Button>
                {!isExpressAuthorized && <ExpressNoAccessInfo/>}
              </Flex>
            </Flex>
            <Flex>
              <TooltipTrigger delay={0}>
                <ActionButton
                  isQuiet
                  isDisabled={isFeedback(selectedVariant)}
                  UNSAFE_className="hover-cursor-pointer"
                  onPress={() => {
                    const logRecords = { source: 'ResultCard#onPress', variant: selectedVariant.id };
                    log('prompt:thumbsup', logRecords);
                    analytics({
                      widget: {
                        name: 'Prompt Template',
                        type: 'NA',
                      },
                      element: 'Like Variation',
                      elementId: 'prompt:thumbsup',
                      type: 'button',
                      action: 'click',
                    }, logRecords);
                    sendFeedback(true, selectedVariant);
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
                    const logRecords = { source: 'ResultCard#onPress', variant: selectedVariant.id };
                    log('prompt:thumbsdown', logRecords);
                    analytics({
                      widget: {
                        name: 'Prompt Template',
                        type: 'NA',
                      },
                      element: 'Dislike Variation',
                      elementId: 'prompt:thumbsdown',
                      type: 'button',
                      action: 'click',
                    }, logRecords);
                    sendFeedback(false, selectedVariant);
                  }}>
                  {isFeedback(selectedVariant) ? <ThumbsDownDisabledIcon /> : <ThumbsDownOutlineIcon />}
                </ActionButton>
                <Tooltip>{formatMessage(intlMessages.promptResultCard.poorButtonTooltip)}</Tooltip>
              </TooltipTrigger>
            </Flex>
          </Flex>
          <VariantImagesView variant={selectedVariant}/>
        </div>
      </div>
    </motion.div>
  );
}
