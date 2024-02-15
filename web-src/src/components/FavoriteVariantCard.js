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
  Button, ActionButton, Flex, Tooltip, TooltipTrigger, View, ContextualHelp, Heading, Content, Image, ProgressCircle,
  MenuTrigger, Menu, Item, Text, DialogContainer, AlertDialog, Divider,
} from '@adobe/react-spectrum';
import React, {
  useCallback, useState,
} from 'react';
import { css } from '@emotion/css';
import { ToastQueue } from '@react-spectrum/toast';
import { useRecoilState } from 'recoil';
import { motion } from 'framer-motion';
import { useToggleFavorite } from '../state/ToggleFavoriteHook.js';
import { variantImagesState } from '../state/VariantImagesState.js';
import { useApplicationContext } from './ApplicationProvider.js';
import { useShellContext } from './ShellProvider.js';
import {
  copyImageToClipboard, copyImageToClipboardLegacy, toHTML, toText,
} from '../helpers/PromptExporter.js';
import { sampleRUM } from '../rum.js';
import { ImageViewer } from './ImageViewer.js';

import CopyOutlineIcon from '../icons/CopyOutlineIcon.js';
import EditIcon from '../icons/EditIcon.js';
import DeleteOutlineIcon from '../icons/DeleteOutlineIcon.js';
import GenAIIcon from '../icons/GenAIIcon.js';
import DownloadIcon from '../icons/DownloadIcon.js';
import MoreIcon from '../icons/MoreIcon.js';

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
  variantThumbImages: css`
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: left;
    width: 100%;
    flex-wrap: wrap;
    padding: 10px;
  `,
  variantThumbImage: css`
    width: 144px;
    height: 144px;
    border-radius: 8px;
  `,
};

export function FavoriteVariantCard({ variant, ...props }) {
  const { firefallService, expressSDKService } = useApplicationContext();
  const { user, isExpressAuthorized } = useShellContext();
  const toggleFavorite = useToggleFavorite();

  const [variantImages, setVariantImages] = useRecoilState(variantImagesState);
  const [imagePromptProgress, setImagePromptProgress] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  let ccEverywhereInstance = null;

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
    - The prompt should be clear and direct, highlighting the main components as concrete as possible: a subject (e.g., a concrete object related to the topic or a person), \
    action (e.g., using headphones, knowledge transfer), and the emotional tone(e.g. happy, persuasive, serious, etc.).
    - An example to the generated image prompt from a given context:
    Context: {
      "Title": "Discover Perfect Sound",
      "Body": "Explore our bestselling wireless headphones."
    }
    Generated Prompt:
    "A happy, confident person enjoying music in an urban park, using high-quality wireless headphones, with the city skyline in the background."
    Here is the JSON context: ${JSON.stringify(variant.content)}`;
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

  const handleGenerateImage = async (imagePrompt) => {
    const callbacks = {
      onPublish: (publishParams) => {
        addImageToVariant(variant.id, publishParams.asset[0].data);
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
  };

  const handleGenerateImagePrompt = useCallback(() => {
    setImagePromptProgress(true);
    generateImagePrompt()
      .then((imagePrompt) => {
        handleGenerateImage(imagePrompt);
      })
      .catch((error) => {
        ToastQueue.negative(error.message, { timeout: 2000 });
      })
      .finally(() => {
        setImagePromptProgress(false);
      });
  }, [generateImagePrompt, setImagePromptProgress]);

  const handleEditGenerateImage = async (index) => {
    const callbacks = {
      onPublish: (publishParams) => {
        replaceImageFromVariant(variant.id, index, publishParams.asset[0].data);
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
            data: variantImages[variant.id][index],
            type: 'image',
            dataType: 'base64',
          },
        },
        callbacks,
      },
      userInfo,
      authInfo,
    );
  };

  const handleImageViewerOpen = (index) => {
    setImageViewerIndex(index);
    setIsImageViewerOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ease: 'easeIn', duration: 0.3 }}>
      <div {...props}
        className={styles.card}
        onClick={() => setSelectedImageIndex(null)}>
        <ImageViewer
          images={variantImages[variant.id]}
          index={imageViewerIndex}
          onIndexChange={setImageViewerIndex}
          open={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
          onEdit={(index) => {
            setIsImageViewerOpen(false);
            handleEditGenerateImage(index);
          }}
          onCopy={(index) => {
            handleCopyImage(variantImages[variant.id][index]);
          }}
          onDownload={(index) => handleDownloadImage(variantImages[variant.id][index])}
        />
        <DialogContainer onDismiss={() => setIsDeleteDialogOpen(false)}>
          {isDeleteDialogOpen && (
            <AlertDialog
              variant="destructive"
              title="Delete Image"
              primaryActionLabel="Delete"
              cancelLabel="Cancel"
              onPrimaryAction={() => {
                deleteImageFromVariant(variant.id, selectedImageIndex);
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
        <div className={styles.variant} dangerouslySetInnerHTML={{ __html: toHTML(variant.content) }} />
        {variantImages[variant.id]
          && <div className={styles.variantThumbImages}>
            {variantImages[variant.id].map((base64Image, index) => {
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
                        onPress={() => handleDownloadImage(base64Image)}>
                        <DownloadIcon />
                      </Button>
                      <Tooltip>Download</Tooltip>
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
                          if (key === 'copy') {
                            handleCopyImage(base64Image);
                          } else if (key === 'delete') {
                            setIsDeleteDialogOpen(true);
                          }
                        }}>
                          <Item key="copy">
                            <CopyOutlineIcon UNSAFE_style={{ boxSizing: 'content-box' }} />
                            <Text>Copy Image</Text>
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
        <View marginTop={'10px'}>
          <Flex direction="row" justifyContent="left">
            <TooltipTrigger delay={0}>
              <ActionButton
                isQuiet
                UNSAFE_className="hover-cursor-pointer"
                onPress={() => {
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
                onPress={handleGenerateImagePrompt}
                isDisabled={!isExpressAuthorized}>
                {imagePromptProgress ? <ProgressCircle size="S" aria-label="Generate" isIndeterminate right="8px" /> : <GenAIIcon marginEnd={'8px'} />}
                Generate Image
              </Button>
              {!isExpressAuthorized
                && <ContextualHelp variant="info">
                  <Heading>You don&apos;t have access to Adobe Express</Heading>
                  <Content>
                    To gain access, submit a request to your IT administrator or sign in with an eligible Adobe ID.
                    If you are an administrator, buy licenses for Adobe Express here.
                  </Content>
                </ContextualHelp>
              }
            </Flex>
          </Flex>
        </View>
      </div>
    </motion.div>
  );
}
