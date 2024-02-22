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
import { useToggleFavorite } from '../state/ToggleFavoriteHook.js';
import { useVariantImages } from '../state/VariantImagesHook.js';
import { useApplicationContext } from './ApplicationProvider.js';
import { useShellContext } from './ShellProvider.js';
import { toHTML, toText } from '../helpers/PromptExporter.js';
import { generateImagePrompt } from '../helpers/ImageHelper.js';
import { sampleRUM } from '../rum.js';
import { VariantImagesView } from './VariantImagesView.js';
import { log } from '../helpers/Tracking.js';
import ExpressNoAccessInfo from './ExpressNoAccessInfo.js';

import CopyOutlineIcon from '../icons/CopyOutlineIcon.js';
import DeleteOutlineIcon from '../icons/DeleteOutlineIcon.js';
import GenAIIcon from '../icons/GenAIIcon.js';

const styles = {
  card: css`
    padding: 10px;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
  `,
  variant: css`
    padding: 10px;
    min-height: 100px;
  `,
};

export function FavoriteVariantCard({ variant, ...props }) {
  const { firefallService, expressSDKService } = useApplicationContext();
  const { isExpressAuthorized } = useShellContext();
  const toggleFavorite = useToggleFavorite();
  const { addImageToVariant } = useVariantImages();

  const [imagePromptProgress, setImagePromptProgress] = useState(false);

  const handleGenerateImage = useCallback(async (imagePrompt) => {
    log('express:favorite:generateimage', { variantId: variant.id });
    const onPublish = (publishParams) => {
      addImageToVariant(variant.id, publishParams.asset[0].data);
    };

    await expressSDKService.handleImageOperation(
      'generateImage',
      {
        outputParams: {
          outputType: 'base64',
        },
        inputParams: {
          promptText: imagePrompt,
        },
        callbacks: {
          onPublish,
        },
      },
    );
  }, [expressSDKService, variant]);

  const handleGenerateImagePrompt = useCallback(() => {
    setImagePromptProgress(true);
    generateImagePrompt(firefallService, variant)
      .then((imagePrompt) => {
        handleGenerateImage(imagePrompt);
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ease: 'easeIn', duration: 0.3 }}>
      <div {...props} className={styles.card}>
        <div className={styles.variant} dangerouslySetInnerHTML={{ __html: toHTML(variant.content) }} />
        <View marginTop={'10px'}>
          <Flex direction="row" justifyContent="left">
            <TooltipTrigger delay={0}>
              <ActionButton
                isQuiet
                UNSAFE_className="hover-cursor-pointer"
                onPress={() => {
                  log('prompt:copyfavorite');
                  sampleRUM('genai:prompt:copyfavorite', { source: 'FavoriteCard#onPress' });
                  navigator.clipboard.writeText(toText(variant.content));
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
                onPress={() => toggleFavorite(variant)}>
                <DeleteOutlineIcon />
              </ActionButton>
              <Tooltip>Remove</Tooltip>
            </TooltipTrigger>
            <Divider size="S" orientation="vertical" marginStart={'size-100'} marginEnd={'size-100'} />
            <Flex direction="row" gap="size-100" alignItems={'center'}>
              <Button
                UNSAFE_className="hover-cursor-pointer"
                marginStart={'size-100'}
                width="size-2000"
                variant="secondary"
                style="fill"
                onPress={() => handleGenerateImage('')}
                isDisabled={!isExpressAuthorized}>
                {imagePromptProgress ? <ProgressCircle size="S" aria-label="Generate" isIndeterminate right="8px" /> : <GenAIIcon marginEnd={'8px'} />}
                Generate Image
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
