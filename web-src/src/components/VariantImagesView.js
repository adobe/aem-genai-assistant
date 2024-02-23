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
import { useApplicationContext } from './ApplicationProvider.js';
import { useVariantImages } from '../state/VariantImagesHook.js';
import { log } from '../helpers/Tracking.js';
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
  const { expressSDKService } = useApplicationContext();
  const { variantImages, replaceImageFromVariant, deleteImageFromVariant } = useVariantImages();
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const handleCopyImage = useCallback((base64Image) => {
    if (isFavorite) {
      log('express:favorite:copyimage', { variant: variant.id });
    } else {
      log('express:copyimage', { variant: variant.id });
    }

    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      copyImageToClipboardLegacy(base64Image);
    } else {
      copyImageToClipboard(base64Image, 'image/png');
    }
    ToastQueue.positive('Copied image to clipboard', { timeout: 1000 });
  }, []);

  const handleEditGenerateImage = useCallback(async (index, variantId) => {
    if (isFavorite) {
      log('express:favorite:editimage', { variant: variantId });
    } else {
      log('express:editimage', { variant: variantId });
    }
    const onPublish = (publishParams) => {
      replaceImageFromVariant(variantId, index, publishParams.asset[0].data);
    };
    const assetData = variantImages[variant.id][index];

    await expressSDKService.handleImageOperation(
      'editImage',
      {
        outputParams: {
          outputType: 'base64',
        },
        inputParams: {
          asset: {
            data: assetData,
            type: 'image',
            dataType: 'base64',
          },
        },
        callbacks: {
          onPublish,
        },
      },
    );
  }, [expressSDKService, variantImages]);

  const handleImageViewerOpen = useCallback((index) => {
    if (isFavorite) {
      log('express:favorite:viewimage', { variant: variant.id });
    } else {
      log('express:viewimage', { variant: variant.id });
    }
    setImageViewerIndex(index);
    setIsImageViewerOpen(true);
  }, []);

  const handleDownloadImage = useCallback((base64Image) => {
    if (isFavorite) {
      log('express:favorite:downloadimage', { variant: variant.id });
    } else {
      log('express:downloadimage', { variant: variant.id });
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
            title="Delete Image"
            primaryActionLabel="Delete"
            cancelLabel="Cancel"
            onPrimaryAction={() => {
              if (isFavorite) {
                log('express:favorite:deleteimage', { variant: variant.id });
              } else {
                log('express:deleteimage', { variant: variant.id });
              }
              deleteImageFromVariant(variant.id, selectedImageIndex);
              setIsDeleteDialogOpen(false);
            }}
            onCancelAction={() => {
              if (isFavorite) {
                log('express:favorite:canceldeleteimage', { variant: variant.id });
              } else {
                log('express:canceldeleteimage', { variant: variant.id });
              }
              setIsDeleteDialogOpen(false);
            }}>
            This will permanently delete the image. Continue?
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
                    <Tooltip>Copy Image</Tooltip>
                  </TooltipTrigger>
                  <TooltipTrigger delay={0}>
                    <Button
                      variant='secondary'
                      style='fill'
                      UNSAFE_className={`${(!isMoreMenuOpen || selectedImageIndex !== index) && 'variant-image-button'} hover-cursor-pointer`}
                      onPress={() => handleEditGenerateImage(index, variant.id)}>
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
    </>
  );
}
