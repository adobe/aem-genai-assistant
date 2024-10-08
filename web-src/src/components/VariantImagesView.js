/*
 * Copyright 2024 Adobe. All rights reserved.
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
  Button, Tooltip, TooltipTrigger, Flex, Image, MenuTrigger, Menu, Item, Text, DialogContainer, AlertDialog,
} from '@adobe/react-spectrum';
import React, {
  useCallback, useState,
} from 'react';
import { css } from '@emotion/css';
import { ToastQueue } from '@react-spectrum/toast';
import { useIntl } from 'react-intl';

import { intlMessages } from './ImageViewer.l10n.js';
import { EXPRESS_LOAD_TIMEOUT } from './Constants.js';
import { useApplicationContext } from './ApplicationProvider.js';
import { useVariantImages } from '../state/VariantImagesHook.js';
import { log, analytics } from '../helpers/MetricsHelper.js';
import { copyImageToClipboard, copyImageToClipboardLegacy } from '../helpers/ImageHelper.js';
import { ImageViewer } from './ImageViewer.js';

import CopyOutlineIcon from '../icons/CopyOutlineIcon.js';
import DeleteOutlineIcon from '../icons/DeleteOutlineIcon.js';
import EditIcon from '../icons/EditIcon.js';
import DownloadIcon from '../icons/DownloadIcon.js';
import MoreIcon from '../icons/MoreIcon.js';

const styles = {
  variantThumbImages: css`
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: left;
    align-items: end;
    width: 100%;
    overflow: auto;
  `,
  favoriteVariantThumbImages: css`
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

export function VariantImagesView({ variant, isFavorite, ...props }) {
  const { expressSdkService } = useApplicationContext();
  const { variantImages, replaceImageFromVariant, deleteImageFromVariant } = useVariantImages();

  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const { formatMessage } = useIntl();

  const handleCopyImage = useCallback((base64Image) => {
    if (isFavorite) {
      const logRecords = { variant: variant.id };
      log('express:favorite:copyimage', logRecords);
      analytics({
        widget: {
          name: 'Favorite Variation',
          type: 'NA',
        },
        element: 'Copy Image',
        elementId: 'express:favorite:copyimage',
        type: 'button',
        action: 'click',
      }, logRecords);
    } else {
      const logRecords = { variant: variant.id };
      log('express:copyimage', logRecords);
      analytics({
        widget: {
          name: 'Prompt Template',
          type: 'NA',
        },
        element: 'Copy Image',
        elementId: 'express:copyimage',
        type: 'button',
        action: 'click',
      }, logRecords);
    }

    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      copyImageToClipboardLegacy(base64Image);
    } else {
      copyImageToClipboard(base64Image, 'image/png');
    }
    ToastQueue.positive(formatMessage(intlMessages.imageViewer.copyImageSuccessToast), { timeout: 1000 });
  }, []);

  const handleEditGenerateImage = useCallback(async (index, variantId) => {
    if (isFavorite) {
      const logRecords = { variant: variantId };
      log('express:favorite:editimage', logRecords);
      analytics({
        widget: {
          name: 'Favorite Variation',
          type: 'NA',
        },
        element: 'Edit Image',
        elementId: 'express:favorite:editimage',
        type: 'button',
        action: 'click',
      }, logRecords);
    } else {
      const logRecords = { variant: variantId };
      log('express:editimage', logRecords);
      analytics({
        widget: {
          name: 'Prompt Template',
          type: 'NA',
        },
        element: 'Edit Image',
        elementId: 'express:editimage',
        type: 'button',
        action: 'click',
      }, logRecords);
    }
    const onPublish = (intent, publishParams) => {
      replaceImageFromVariant(variantId, index, publishParams.asset[0].data);
    };
    const onError = (err) => {
      console.error('Error:', err.toString());
      ToastQueue.negative(formatMessage(intlMessages.imageViewer.editImageFailedToast), { timeout: 2000 });
    };
    const assetData = variantImages[variant.id][index];

    const success = await expressSdkService.handleImageOperation(
      'editImage',
      {
        appConfig: {
          callbacks: {
            onPublish,
            onError,
          },
          metaData: {
          },
        },
        docConfig: {
          asset: {
            data: assetData,
            type: 'image',
            dataType: 'base64',
          },

        },
        exportConfig: [],
        containerConfig: {
          loadTimeout: EXPRESS_LOAD_TIMEOUT.EDIT_IMAGE,
        },
      },
    );

    if (!success) {
      ToastQueue.negative(formatMessage(intlMessages.imageViewer.editImageFailedToast), { timeout: 2000 });
    }
  }, [expressSdkService, variantImages]);

  const handleImageViewerOpen = useCallback((index) => {
    if (isFavorite) {
      const logRecords = { variant: variant.id };
      log('express:favorite:viewimage', logRecords);
      analytics({
        widget: {
          name: 'Favorite Variation',
          type: 'NA',
        },
        element: 'View Image',
        elementId: 'express:favorite:viewimage',
        type: 'button',
        action: 'click',
      }, logRecords);
    } else {
      const logRecords = { variant: variant.id };
      log('express:viewimage', logRecords);
      analytics({
        widget: {
          name: 'Prompt Template',
          type: 'NA',
        },
        element: 'View Image',
        elementId: 'express:viewimage',
        type: 'button',
        action: 'click',
      }, logRecords);
    }
    setImageViewerIndex(index);
    setIsImageViewerOpen(true);
  }, []);

  const handleDownloadImage = useCallback((base64Image) => {
    if (isFavorite) {
      const logRecords = { variant: variant.id };
      log('express:favorite:downloadimage', logRecords);
      analytics({
        widget: {
          name: 'Favorite Variation',
          type: 'NA',
        },
        element: 'Download Image',
        elementId: 'express:favorite:downloadimage',
        type: 'button',
        action: 'click',
      }, logRecords);
    } else {
      const logRecords = { variant: variant.id };
      log('express:downloadimage', logRecords);
      analytics({
        widget: {
          name: 'Prompt Template',
          type: 'NA',
        },
        element: 'Download Image',
        elementId: 'express:downloadimage',
        type: 'button',
        action: 'click',
      }, logRecords);
    }
    const link = document.createElement('a');
    link.href = base64Image;
    link.download = 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <>
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
            title={formatMessage(intlMessages.imageViewer.deleteImageAlertTitle)}
            primaryActionLabel={formatMessage(intlMessages.imageViewer.deleteButtonLabel)}
            cancelLabel={formatMessage(intlMessages.imageViewer.cancelButtonLabel)}
            onPrimaryAction={() => {
              if (isFavorite) {
                const logRecords = { variant: variant.id };
                log('express:favorite:deleteimage', logRecords);
                analytics({
                  widget: {
                    name: 'Favorite Variation',
                    type: 'NA',
                  },
                  element: 'Delete Image',
                  elementId: 'express:favorite:deleteimage',
                  type: 'button',
                  action: 'click',
                }, logRecords);
              } else {
                const logRecords = { variant: variant.id };
                log('express:deleteimage', logRecords);
                analytics({
                  widget: {
                    name: 'Prompt Template',
                    type: 'NA',
                  },
                  element: 'Delete Image',
                  elementId: 'express:deleteimage',
                  type: 'button',
                  action: 'click',
                }, logRecords);
              }
              deleteImageFromVariant(variant.id, selectedImageIndex);
              setIsDeleteDialogOpen(false);
            }}
            onCancelAction={() => {
              if (isFavorite) {
                const logRecords = { variant: variant.id };
                log('express:favorite:canceldeleteimage', logRecords);
                analytics({
                  widget: {
                    name: 'Favorite Variation',
                    type: 'NA',
                  },
                  element: 'Cancel Delete Image',
                  elementId: 'express:favorite:canceldeleteimage',
                  type: 'button',
                  action: 'click',
                }, logRecords);
              } else {
                const logRecords = { variant: variant.id };
                log('express:canceldeleteimage', logRecords);
                analytics({
                  widget: {
                    name: 'Prompt Template',
                    type: 'NA',
                  },
                  element: 'Cancel Delete Image',
                  elementId: 'express:canceldeleteimage',
                  type: 'button',
                  action: 'click',
                }, logRecords);
              }
              setIsDeleteDialogOpen(false);
            }}>
            {formatMessage(intlMessages.imageViewer.deleteImageDialogQuestion)}
          </AlertDialog>
        )}
      </DialogContainer>
      {variantImages[variant.id]?.length > 0
        && <div className={isFavorite ? styles.favoriteVariantThumbImages : styles.variantThumbImages}>
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
                      onPress={() => handleCopyImage(base64Image)}>
                      <CopyOutlineIcon />
                    </Button>
                    <Tooltip>{formatMessage(intlMessages.imageViewer.copyImageButtonTooltip)}</Tooltip>
                  </TooltipTrigger>
                  <TooltipTrigger delay={0}>
                    <Button
                      variant='secondary'
                      style='fill'
                      UNSAFE_className={`${(!isMoreMenuOpen || selectedImageIndex !== index) && 'variant-image-button'} hover-cursor-pointer`}
                      onPress={() => handleEditGenerateImage(index, variant.id)}>
                      <EditIcon />
                    </Button>
                    <Tooltip>{formatMessage(intlMessages.imageViewer.editButtonTooltip)}</Tooltip>
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
                          <Text>{formatMessage(intlMessages.imageViewer.downloadButtonLabel)}</Text>
                        </Item>
                        <Item key="delete">
                          <DeleteOutlineIcon UNSAFE_style={{ boxSizing: 'content-box' }} />
                          <Text>{formatMessage(intlMessages.imageViewer.deleteButtonLabel)}</Text>
                        </Item>
                      </Menu>
                    </MenuTrigger>
                    <Tooltip>{formatMessage(intlMessages.imageViewer.moreButtonTooltip)}</Tooltip>
                  </TooltipTrigger>
                </Flex>
              </div>
            );
          })}
        </div>
      }
    </>
  );
}
