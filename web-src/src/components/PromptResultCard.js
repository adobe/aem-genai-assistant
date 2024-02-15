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
  Button, ActionButton, Tooltip, TooltipTrigger, ContextualHelp, Heading, Content, Flex, Image, ProgressCircle,
  MenuTrigger, Menu, Item, Text, DialogContainer, AlertDialog, Divider,
} from '@adobe/react-spectrum';
import React, {
  useCallback, useState, useEffect, useRef,
} from 'react';
import { css } from '@emotion/css';
import { motion } from 'framer-motion';
import { ToastQueue } from '@react-spectrum/toast';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useIsFavorite } from '../state/IsFavoriteHook.js';
import { useIsFeedback } from '../state/IsFeedbackHook.js';
import { useToggleFavorite } from '../state/ToggleFavoriteHook.js';
import { useSaveFeedback } from '../state/SaveFeedbackHook.js';
import { useApplicationContext } from './ApplicationProvider.js';
import { useShellContext } from './ShellProvider.js';
import { promptState } from '../state/PromptState.js';
import { parametersState } from '../state/ParametersState.js';
import { resultsState } from '../state/ResultsState.js';
import { variantImagesState } from '../state/VariantImagesState.js';
import { useSaveResults } from '../state/SaveResultsHook.js';
import { sampleRUM } from '../rum.js';
import {
  copyImageToClipboard, copyImageToClipboardLegacy, toHTML, toText,
} from '../helpers/PromptExporter.js';
import { ImageViewer } from './ImageViewer.js';

import RefreshIcon from '../icons/RefreshIcon.js';
import FavoritesIcon from '../icons/FavoritesIcon.js';
import FavoritesOutlineIcon from '../icons/FavoritesOutlineIcon.js';
import CopyOutlineIcon from '../icons/CopyOutlineIcon.js';
import DeleteOutlineIcon from '../icons/DeleteOutlineIcon.js';
import ThumbsUpOutlineIcon from '../icons/ThumbsUpOutlineIcon.js';
import ThumbsDownOutlineIcon from '../icons/ThumbsDownOutlineIcon.js';
import ThumbsUpDisabledIcon from '../icons/ThumbsUpDisabledIcon.js';
import ThumbsDownDisabledIcon from '../icons/ThumbsDownDisabledIcon.js';
import EditIcon from '../icons/EditIcon.js';
import GenAIIcon from '../icons/GenAIIcon.js';
import DownloadIcon from '../icons/DownloadIcon.js';
import MoreIcon from '../icons/MoreIcon.js';

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
  variantThumbImages: css`
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: left;
    align-items: end;
    width: 100%;
    overflow: auto;
  `,
  variantThumbImage: css`
    width: 144px;
    height: 144px;
    border-radius: 8px;
  `,
};

export function PromptResultCard({ result, ...props }) {
  const { firefallService, expressSDKService } = useApplicationContext();
  const { user, isExpressAuthorized } = useShellContext();
  const [selectedVariant, setSelectedVariant] = useState(result.variants[0]);
  const setPrompt = useSetRecoilState(promptState);
  const setParameters = useSetRecoilState(parametersState);
  const setResults = useSetRecoilState(resultsState);
  const isFavorite = useIsFavorite();
  const isFeedback = useIsFeedback();
  const toggleFavorite = useToggleFavorite();
  const saveFeedback = useSaveFeedback();
  const saveResults = useSaveResults();
  const resultsEndRef = useRef();

  const [variantImages, setVariantImages] = useRecoilState(variantImagesState);
  const [imagePromptProgress, setImagePromptProgress] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  let ccEverywhereInstance = null;

  useEffect(() => {
    if (resultsEndRef.current) {
      resultsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [setResults]);

  const sendFeedback = useCallback((sentiment) => {
    firefallService.feedback(result.id, sentiment)
      .then((id) => {
        ToastQueue.positive('Feedback sent', { timeout: 1000 });
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
    console.debug('deleteVariant', variantId);
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

  const addImageToVariant = (variantId, base64Image) => {
    setVariantImages((imagesByVariant) => ({
      ...imagesByVariant,
      [variantId]: [...(imagesByVariant[variantId] || []), base64Image],
    }));
  };

  const replaceImageFromVariant = (variantId, index, base64Image) => {
    setVariantImages((imagesByVariant) => {
      // Copy the existing array for the variant
      const copyImages = [...imagesByVariant[variantId]];
      // Replace the image at the specified index
      copyImages[index] = base64Image;
      // Return the updated imagesByVariant object
      return {
        ...imagesByVariant,
        [variantId]: copyImages,
      };
    });
  };

  const deleteImageFromVariant = (variantId, index) => {
    setVariantImages((imagesByVariant) => {
      // Copy the existing array for the variant
      const copyImages = [...imagesByVariant[variantId]];
      // Remove the image at the specified index
      copyImages.splice(index, 1);
      // Return the updated imagesByVariant object
      return {
        ...imagesByVariant,
        [variantId]: copyImages,
      };
    });
  };

  const generateImagePrompt = useCallback(async () => {
    const variantToImagePrompt = `I want to create images using a text-to-image model. For this, I need a concise, one-sentence image prompt created by following these steps:
    - Read and understand the subject or theme from the given JSON context below.
    - Specify key elements such as individuals, actions, and emotions within this context, ensuring they align with the theme.
    - Formulate a single-sentence prompt which includes these elements, and also focusing on realism and the activity.
    - The prompt should be clear and direct, highlighting the main components as concrete as possible: a subject (e.g., a concrete object related to the topic or a person), action (e.g., using headphones, knowledge transfer), and the emotional tone(e.g. happy, persuasive, serious, etc.).
    - An example to the generated image prompt from a given context:
    Context: {
      "Title": "Discover Perfect Sound",
      "Body": "Explore our bestselling wireless headphones."
    }
    Generated Prompt:
    "A happy, confident person enjoying music in an urban park, using high-quality wireless headphones, with the city skyline in the background."
    Here is the JSON context: ${JSON.stringify(selectedVariant.content)}`;
    const { queryId, response } = await firefallService.complete(variantToImagePrompt, 0);
    return response;
  }, [firefallService]);

  const handleDownloadImage = useCallback((base64Image) => {
    const link = document.createElement('a');
    link.href = base64Image;
    link.download = 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleCopyImage = useCallback((base64Image) => {
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      copyImageToClipboardLegacy(base64Image);
    } else {
      copyImageToClipboard(base64Image, 'image/png');
    }
    ToastQueue.positive('Copied image to clipboard', { timeout: 1000 });
  }, []);

  const handleGenerateImage = useCallback(async (imagePrompt, variantId) => {
    const callbacks = {
      onPublish: (publishParams) => {
        addImageToVariant(variantId, publishParams.asset[0].data);
      },
    };

    const userInfo = {
      profile: {
        userId: user.imsProfile.userId,
        serviceCode: null,
        serviceLevel: null,
      },
    };

    const authInfo = {
      accessToken: user.imsToken,
      useJumpUrl: false,
      forceJumpCheck: false,
    };

    if (ccEverywhereInstance == null) {
      ccEverywhereInstance = await expressSDKService.initExpressEditor();
    }
    ccEverywhereInstance.miniEditor.createImageFromText(
      {
        outputParams: {
          outputType: 'base64',
        },
        inputParams: {
          promptText: imagePrompt,
        },
        callbacks,
      },
      userInfo,
      authInfo,
    );
  }, [expressSDKService, user, selectedVariant]);

  const handleGenerateImagePrompt = useCallback((variantId) => {
    setImagePromptProgress(true);
    generateImagePrompt()
      .then((imagePrompt) => {
        handleGenerateImage('', variantId);
      })
      .catch((error) => {
        ToastQueue.negative(error.message, { timeout: 2000 });
      })
      .finally(() => {
        setImagePromptProgress(false);
      });
  }, [generateImagePrompt, setImagePromptProgress]);

  const handleEditGenerateImage = useCallback(async (index) => {
    const callbacks = {
      onPublish: (publishParams) => {
        replaceImageFromVariant(selectedVariant.id, index, publishParams.asset[0].data);
      },
    };

    const userInfo = {
      profile: {
        userId: user.imsProfile.userId,
        serviceCode: null,
        serviceLevel: null,
      },
    };

    const authInfo = {
      accessToken: user.imsToken,
      useJumpUrl: false,
      forceJumpCheck: false,
    };

    if (ccEverywhereInstance == null) {
      ccEverywhereInstance = await expressSDKService.initExpressEditor();
    }
    ccEverywhereInstance.miniEditor.editImage(
      {
        outputParams: {
          outputType: 'base64',
        },
        inputParams: {
          asset: {
            data: variantImages[selectedVariant.id][index],
            type: 'image',
            dataType: 'base64',
          },
        },
        callbacks,
      },
      userInfo,
      authInfo,
    );
  }, [expressSDKService, user, selectedVariant, variantImages]);

  const handleImageViewerOpen = (index) => {
    setImageViewerIndex(index);
    setIsImageViewerOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'easeInOut', duration: 0.3 }}>
      <div {...props} className={styles.card} ref={resultsEndRef} onClick={() => setSelectedImageIndex(null)}>
        <ImageViewer
          images={variantImages[selectedVariant.id]}
          index={imageViewerIndex}
          onIndexChange={setImageViewerIndex}
          open={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
          onEdit={(index) => {
            setIsImageViewerOpen(false);
            handleEditGenerateImage(index);
          }}
          onCopy={(index) => {
            handleCopyImage(variantImages[selectedVariant.id][index]);
          }}
          onDownload={(index) => handleDownloadImage(variantImages[selectedVariant.id][index])}
        />
        <DialogContainer onDismiss={() => setIsDeleteDialogOpen(false)}>
          {isDeleteDialogOpen && (
            <AlertDialog
              variant="destructive"
              title="Delete Image"
              primaryActionLabel="Delete"
              cancelLabel="Cancel"
              onPrimaryAction={() => {
                deleteImageFromVariant(selectedVariant.id, selectedImageIndex);
                setIsDeleteDialogOpen(false);
              }}
              onCancelAction={() => {
                console.log("You've canceled the delete action");
                setIsDeleteDialogOpen(false);
              }}>
              This will permanently delete the image. Continue?
            </AlertDialog>
          )}
        </DialogContainer>
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
          {variantImages[selectedVariant.id]
            && <div className={styles.variantThumbImages}>
              {variantImages[selectedVariant.id].map((base64Image, index) => {
                return (
                  <div key={index} className={'variant-image-wrapper'}>
                    <div onClick={() => handleImageViewerOpen(index)}>
                      <Image src={base64Image}
                        objectFit={'cover'}
                        UNSAFE_className={`${styles.variantThumbImage} ${(!isMoreMenuOpen || selectedImageIndex !== index) ? 'variant-thumb-image' : 'variant-thumb-image-selected'} hover-cursor-pointer`}
                      />
                    </div>
                    <Flex direction={'row'} width={'100%'} gap={'size-100'} position={'absolute'} bottom={'size-100'} justifyContent={'center'}>
                      <TooltipTrigger delay={0}>
                        <Button
                          variant='secondary'
                          style='fill'
                          UNSAFE_className={`${(!isMoreMenuOpen || selectedImageIndex !== index) && 'variant-image-button'} hover-cursor-pointer`}
                          onPress={() => handleCopyImage(base64Image)}>
                          <CopyOutlineIcon />
                        </Button>
                        <Tooltip>Copy Image</Tooltip>
                      </TooltipTrigger>
                      <TooltipTrigger delay={0}>
                        <Button
                          variant='secondary'
                          style='fill'
                          UNSAFE_className={`${(!isMoreMenuOpen || selectedImageIndex !== index) && 'variant-image-button'} hover-cursor-pointer`}
                          onPress={() => handleEditGenerateImage(index)}>
                          <EditIcon />
                        </Button>
                        <Tooltip>Edit</Tooltip>
                      </TooltipTrigger>
                      <TooltipTrigger delay={0}>
                        <MenuTrigger onOpenChange={(isOpen) => {
                          setIsMoreMenuOpen(isOpen);
                          setSelectedImageIndex(index);
                        }}>
                          <Button
                            variant='secondary'
                            style='fill'
                            UNSAFE_className={`${(!isMoreMenuOpen || selectedImageIndex !== index) && 'variant-image-button'} hover-cursor-pointer`}>
                            <MoreIcon />
                          </Button>
                          <Menu width="size-1700" onAction={(key) => {
                            if (key === 'download') {
                              handleDownloadImage(base64Image);
                            } else if (key === 'delete') {
                              setIsDeleteDialogOpen(true);
                            }
                          }}>
                            <Item key="download">
                              <DownloadIcon UNSAFE_style={{ boxSizing: 'content-box' }} />
                              <Text>Download</Text>
                            </Item>
                            <Item key="delete">
                              <DeleteOutlineIcon UNSAFE_style={{ boxSizing: 'content-box' }} />
                              <Text>Delete</Text>
                            </Item>
                          </Menu>
                        </MenuTrigger>
                        <Tooltip>More</Tooltip>
                      </TooltipTrigger>
                    </Flex>
                  </div>
                );
              })}
            </div>
          }
          <div className={styles.resultActions}>
            <Flex direction="row">
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
                    sampleRUM('genai:prompt:copy', { source: 'ResultCard#onPress' });
                    navigator.clipboard.writeText(toText(selectedVariant.content));
                    ToastQueue.positive('Copied text to clipboard', { timeout: 1000 });
                  }}>
                  <CopyOutlineIcon />
                </ActionButton>
                <Tooltip>Copy</Tooltip>
              </TooltipTrigger>
              <TooltipTrigger delay={0}>
                <ActionButton
                  isQuiet
                  isDisabled={isFeedback(selectedVariant)}
                  UNSAFE_className="hover-cursor-pointer"
                  onPress={() => {
                    sampleRUM('genai:prompt:thumbsup', { source: 'ResultCard#onPress' });
                    sendFeedback(true);
                    saveFeedback(selectedVariant);
                  }}>
                  {isFeedback(selectedVariant) ? <ThumbsUpDisabledIcon /> : <ThumbsUpOutlineIcon />}
                </ActionButton>
                <Tooltip>Good</Tooltip>
              </TooltipTrigger>
              <TooltipTrigger delay={0}>
                <ActionButton
                  isQuiet
                  isDisabled={isFeedback(selectedVariant)}
                  UNSAFE_className="hover-cursor-pointer"
                  onPress={() => {
                    sampleRUM('genai:prompt:thumbsdown', { source: 'ResultCard#onPress' });
                    sendFeedback(false);
                    saveFeedback(selectedVariant);
                  }}>
                  {isFeedback(selectedVariant) ? <ThumbsDownDisabledIcon /> : <ThumbsDownOutlineIcon />}
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
                  Generate Image
                </Button>
                {!isExpressAuthorized
                  && <ContextualHelp variant="info">
                    <Heading>You don&apos;t have access to Adobe Express</Heading>
                    <Content>
                      To gain access, submit a request to your IT administrator or sign in with an elgible Adobe ID.
                    </Content>
                  </ContextualHelp>
                }
              </Flex>
            </Flex>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
