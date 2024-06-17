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
  Button, ActionButton, Flex, Tooltip, TooltipTrigger, View, ProgressCircle, Divider,
} from '@adobe/react-spectrum';
import React, {
  useCallback, useState,
} from 'react';
import { css } from '@emotion/css';
import { ToastQueue } from '@react-spectrum/toast';
import { motion } from 'framer-motion';
import { useIntl } from 'react-intl';

import { intlMessages } from './Favorites.l10n.js';
import { intlMessages as appIntlMessages } from './App.l10n.js';
import { EXPRESS_LOAD_TIMEOUT } from './Constants.js';
import { useToggleFavorite } from '../state/ToggleFavoriteHook.js';
import { useVariantImages } from '../state/VariantImagesHook.js';
import { useApplicationContext } from './ApplicationProvider.js';
import { useShellContext } from './ShellProvider.js';
import { toHTML, toText } from '../helpers/PromptExporter.js';
import { generateImagePrompt } from '../helpers/ImageHelper.js';
import { VariantImagesView } from './VariantImagesView.js';
import { log } from '../helpers/MetricsHelper.js';
import ExpressNoAccessInfo from './ExpressNoAccessInfo.js';

import CopyOutlineIcon from '../icons/CopyOutlineIcon.js';
import DeleteOutlineIcon from '../icons/DeleteOutlineIcon.js';
import GenAIIcon from '../icons/GenAIIcon.js';
import { createToastErrorMessage, getErrorCodeSubstring } from '../helpers/FormatHelper.js';

const styles = {
  card: css`
    position: relative;
    padding: 10px;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
  `,
  selectedCard: css`
    background-color: rgba(0, 116, 217, 0.07);
    border-color: #0074D9;
  `,
  variant: css`
    padding: 10px;
    min-height: 100px;
  `,
  selectionToggle: css`
    position: absolute;
    top: 5px;
    right: 0;
  `,
};

export function FavoriteVariantCard({
  variant, isSelected, setSelected, ...props
}) {
  const { firefallService, expressSdkService } = useApplicationContext();
  const { isExpressAuthorized } = useShellContext();
  const { formatMessage } = useIntl();

  const toggleFavorite = useToggleFavorite();
  const { addImageToVariant } = useVariantImages();

  const [imagePromptProgress, setImagePromptProgress] = useState(false);

  const handleGenerateImage = useCallback(async (imagePrompt) => {
    log('express:favorite:generateimage', { variantId: variant.id });
    const onPublish = (intent, publishParams) => {
      addImageToVariant(variant.id, publishParams.asset[0].data);
    };
    const onError = (err) => {
      console.error('Error:', err.toString());
      ToastQueue.negative(formatMessage(intlMessages.favoritesView.generateImageFailedToast), { timeout: 2000 });
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
      ToastQueue.negative(formatMessage(intlMessages.favoritesView.generateImageFailedToast), { timeout: 2000 });
    }
  }, [expressSdkService, variant]);

  const handleGenerateImagePrompt = useCallback(() => {
    setImagePromptProgress(true);
    generateImagePrompt(firefallService, variant)
      .then((imagePrompt) => {
        handleGenerateImage(imagePrompt);
      })
      .catch((error) => {
        const errorL10nId = getErrorCodeSubstring(error.message);
        let errorMessage;

        if (errorL10nId) {
          const localizedErrorMsg = formatMessage(appIntlMessages.app[errorL10nId]);
          errorMessage = createToastErrorMessage(error.message, localizedErrorMsg);
        } else {
          errorMessage = error.message;
        }

        ToastQueue.negative(errorMessage, { timeout: 2000 });
      })
      .finally(() => {
        setImagePromptProgress(false);
      });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ease: 'easeIn', duration: 0.3 }}>
      <div
         className={[styles.card, isSelected && styles.selectedCard].join(' ')}
         onClick={() => setSelected(!isSelected)}
         {...props}>
        <div className={styles.variant} dangerouslySetInnerHTML={{ __html: toHTML(variant.content) }} />
        <View marginTop={'10px'} marginBottom={'6px'}>
          <Flex direction="row" justifyContent="left">
            <TooltipTrigger delay={0}>
              <ActionButton
                isQuiet
                UNSAFE_className="hover-cursor-pointer"
                onPress={() => {
                  log('prompt:copyfavorite', { source: 'FavoriteCard#onPress' });
                  navigator.clipboard.writeText(toText(variant.content));
                  ToastQueue.positive(
                    formatMessage(intlMessages.favoritesView.copyTextSuccessToast),
                    { timeout: 1000 },
                  );
                }}>
                <CopyOutlineIcon />
              </ActionButton>
              <Tooltip>{formatMessage(intlMessages.favoritesView.copyButtonTooltip)}</Tooltip>
            </TooltipTrigger>
            <TooltipTrigger delay={0}>
              <ActionButton
                isQuiet
                UNSAFE_className="hover-cursor-pointer"
                onPress={() => toggleFavorite(variant)}>
                <DeleteOutlineIcon />
              </ActionButton>
              <Tooltip>{formatMessage(intlMessages.favoritesView.removeButtonTooltip)}</Tooltip>
            </TooltipTrigger>
            <Divider size="S" orientation="vertical" marginStart={'size-100'} marginEnd={'size-100'} />
            <Flex direction="row" gap="size-100" alignItems={'center'}>
              <Button
                UNSAFE_className="hover-cursor-pointer"
                marginStart={'size-100'}
                width="size-2000"
                variant="secondary"
                style="fill"
                onPress={() => handleGenerateImagePrompt()}
                isDisabled={!isExpressAuthorized}>
                {imagePromptProgress ? <ProgressCircle size="S" aria-label="Generate" isIndeterminate right="8px" /> : <GenAIIcon marginEnd={'8px'} />}
                {formatMessage(intlMessages.favoritesView.generateImageButtonLabel)}
              </Button>
              {!isExpressAuthorized && <ExpressNoAccessInfo />}
            </Flex>
          </Flex>
        </View>
        <VariantImagesView variant={variant} isFavorite={true} />
      </div>
    </motion.div>
  );
}
