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
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { variantImagesState } from './VariantImagesState.js';

export const useVariantImages = () => {
  const [variantImages, setVariantImages] = useRecoilState(variantImagesState);

  const addImageToVariant = useCallback((variantId, base64Image) => {
    setVariantImages((imagesByVariant) => ({
      ...imagesByVariant,
      [variantId]: [...(imagesByVariant[variantId] || []), base64Image],
    }));
  }, []);

  const replaceImageFromVariant = useCallback((variantId, index, base64Image) => {
    setVariantImages((imagesByVariant) => {
      const copyImages = [...imagesByVariant[variantId]];
      copyImages[index] = base64Image;

      return {
        ...imagesByVariant,
        [variantId]: copyImages,
      };
    });
  }, []);

  const deleteImageFromVariant = useCallback((variantId, index) => {
    setVariantImages((imagesByVariant) => {
      const copyImages = [...imagesByVariant[variantId]];
      copyImages.splice(index, 1); // Remove the image at the specified index

      return {
        ...imagesByVariant,
        [variantId]: copyImages,
      };
    });
  }, []);

  return {
    variantImages, addImageToVariant, replaceImageFromVariant, deleteImageFromVariant,
  };
};
