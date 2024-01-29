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
  Image, Button,
} from '@adobe/react-spectrum';
import React, { useEffect, useCallback, useRef } from 'react';
import { css } from '@emotion/css';

import Close from '@spectrum-icons/workflow/Close';
import ChevronLeft from '@spectrum-icons/workflow/ChevronLeft';
import ChevronRight from '@spectrum-icons/workflow/ChevronRight';
import EditIcon from '../icons/EditIcon.js';
import CopyOutlineIcon from '../icons/CopyOutlineIcon.js';

const styles = {
  overlay: css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
  `,
  imageWrapper: css`
    max-width: 90vh;
  `,
  imagePreview: css`
    max-width: 100%;
    height: auto;
    display: block;
    border-radius: 8px;
  `,
  imageNavBase: css`
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    position: absolute;
    height: 100%;
    top: 0;
  `,
  imageNav: css`
    display: flex;
    flex: 1 1 auto;
    flex-wrap: nowrap;
  `,
};

const derivedStyles = {
  leftImageNav: css`
    ${styles.imageNavBase}
    right: 100%;
  `,
  rightImageNav: css`
    ${styles.imageNavBase}
    left: 100%;
  `,
};

export function ImageViewer({
  images, index, onIndexChange, open, onClose, onEdit, onCopy, ...props
}) {
  const handleNextImage = useCallback(() => {
    onIndexChange((prevIndex) => (prevIndex + 1) % images.length);
  }, [images?.length]);

  const handlePreviousImage = useCallback(() => {
    onIndexChange((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images?.length]);

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    console.log('handleKeyDown');
    if (event.key === 'ArrowRight') {
      handleNextImage();
    } else if (event.key === 'ArrowLeft') {
      handlePreviousImage();
    } else if (event.key === 'Escape') {
      onClose();
    }
  };

  // Focus the image viewer when it opens
  const imageNavRef = useRef(null);
  useEffect(() => {
    if (open && imageNavRef.current) {
      imageNavRef.current.focus();
    }
  }, [open]);

  return (
    <>
      {open && (
        <div {...props}
          className={styles.overlay} ref={imageNavRef} onClick={onClose} onKeyDown={handleKeyDown} tabIndex={-1}>
          <div className={`variant-image-wrapper ${styles.imageWrapper}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.imageNav}>
              <Image src={images[index]} objectFit={'contain'} UNSAFE_className={styles.imagePreview} />
              {images.length > 1 && (
                <>
                  <div className={derivedStyles.leftImageNav}>
                    <Button
                      variant='secondary'
                      style='fill'
                      margin='size-200'
                      UNSAFE_className={'hover-cursor-pointer'}
                      onPress={handlePreviousImage}>
                      <ChevronLeft />
                    </Button>
                  </div>
                  <div className={derivedStyles.rightImageNav}>
                    <Button
                      variant='secondary'
                      style='fill'
                      margin='size-200'
                      UNSAFE_className={'hover-cursor-pointer'}
                      onPress={handleNextImage}>
                      <ChevronRight />
                    </Button>
                  </div>
                </>
              )}
            </div>
            <Button
              variant='secondary'
              style='fill'
              width='size-1000'
              position='absolute'
              top='size-200'
              left='size-200'
              UNSAFE_className={'variant-image-button hover-cursor-pointer'}
              onPress={() => onEdit(index)}>
              <EditIcon marginEnd={'8px'} />
              Edit
            </Button>
            <Button
              variant='secondary'
              style='fill'
              width='size-1000'
              position='absolute'
              top='size-200'
              right='size-200'
              UNSAFE_className={'variant-image-button hover-cursor-pointer'}
              onPress={() => onCopy(index)}>
              <CopyOutlineIcon marginEnd={'8px'} />
              Copy
            </Button>
            <Button
              variant='secondary'
              staticColor='white'
              position='absolute'
              top='-15px'
              right='-40px'
              UNSAFE_className={'hover-cursor-pointer'}
              UNSAFE_style={{ borderColor: 'transparent' }}
              onPress={onClose}>
              <Close />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
