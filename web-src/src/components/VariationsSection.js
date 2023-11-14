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

import React, { useCallback, useContext } from 'react';
import {
  View, IllustratedMessage, Heading, Content, Flex, Tooltip, TooltipTrigger, ActionButton, Well,
} from '@adobe/react-spectrum';
import { ToastQueue } from '@react-spectrum/toast';

import Star from '@spectrum-icons/workflow/Star';
import StarOutline from '@spectrum-icons/workflow/StarOutline';
import ThumbUp from '@spectrum-icons/workflow/ThumbUp';
import ThumbDown from '@spectrum-icons/workflow/ThumbDown';
import Copy from '@spectrum-icons/workflow/Copy';
import Delete from '@spectrum-icons/workflow/Delete';

import { TransitionGroup, CSSTransition } from 'react-transition-group';

import EmptyIcon from '@spectrum-icons/workflow/AnnotatePen';
import { LOCAL_STORAGE_KEY } from '../constants/Constants.js';
import { ApplicationContext } from './ApplicationProvider.js';
import { useAuthContext } from './AuthProvider.js';

function VariationsSection({
  variations, favorites, onVariationsChange, onFavoritesChange,
}) {
  const { firefallService } = useContext(ApplicationContext);
  const { imsToken } = useAuthContext();

  // Function to check if a variation is a favorite and return boolean
  const isAlreadyFavoriteHandler = useCallback((id) => {
    const storedFavorites = localStorage.getItem(LOCAL_STORAGE_KEY);
    /* eslint-disable-next-line no-shadow */
    const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    /* eslint-disable-next-line no-shadow */
    const favorite = favorites.find((favorite) => favorite.id === id);

    return !!favorite;
  }, [favorites]);

  // Function to add a favorite and update local storage
  const addFavoriteHandler = useCallback((item) => {
    if (isAlreadyFavoriteHandler(item.id)) {
      return;
    }

    // Add the item to the favorites state
    const updatedFavorites = [...favorites, item];
    onFavoritesChange(updatedFavorites);

    // Update the local storage with the new favorites
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedFavorites));
  }, [favorites]);

  // Function to favorite a variation
  const favoriteVariationHandler = useCallback((id) => {
    const updatedVariations = variations.map((variation) => {
      if (variation.id === id) {
        /* eslint-disable no-param-reassign */
        variation.isFavorite = true;
        addFavoriteHandler(variation);
      }
      return variation;
    });
    onVariationsChange(updatedVariations);
  }, [variations]);

  const feedbackHandler = useCallback((queryId, sentiment) => {
    firefallService.feedback(queryId, sentiment, imsToken)
      .then((result) => {
        console.log(`feedbackId: ${result.feedbackId}`);
        ToastQueue.positive('Thanks for your feedback!', { timeout: 2000 });
      })
      .catch((error) => {
        console.error(error);
        ToastQueue.negative('Something went wrong. Please try again!', { timeout: 2000 });
      });
  }, [firefallService]);

  // Function to copy a variation to the clipboard
  const copyVariationHandler = useCallback((id) => {
    /* eslint-disable-next-line no-shadow */
    const variation = variations.find((variation) => variation.id === id);
    navigator.clipboard.writeText(variation.content);

    ToastQueue.positive('Variation copied to clipboard!', { timeout: 2000 });
  }, [variations]);

  // Function to delete a variation
  const deleteVariationHandler = useCallback((id) => {
    const updatedVariations = variations.filter((variation) => variation.id !== id);
    onVariationsChange(updatedVariations);
  }, [variations]);

  return (
    <>
      {(variations.length === 0) ? (
        <IllustratedMessage>
          <EmptyIcon size={'XL'}/>
          <Heading>Nothing here yet</Heading>
          <Content>Set up your prompt to generate new variations</Content>
        </IllustratedMessage>
      ) : (
        <View UNSAFE_className="results-enter" marginTop="size-300" marginBottom="size-300" UNSAFE_style={{ 'overflow-x': 'hidden' }}>
          <Flex direction="column" gap="size-300">
            <TransitionGroup component={null}>
              {variations.length
                && variations.map((variation) => (
                  <CSSTransition
                    key={variation.id}
                    timeout={500}
                    classNames="fade"
                  >
                    <View
                      borderRadius="regular"
                      paddingRight="24px"
                      key={variation.id}
                    >
                      <Flex direction="row" gap="size-100" justifyContent="right">
                        <TooltipTrigger delay={0}>
                          <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer" onPress={() => favoriteVariationHandler(variation.id)}>
                            {variation.isFavorite ? <Star /> : <StarOutline />}
                          </ActionButton>
                          <Tooltip>Save Variation</Tooltip>
                        </TooltipTrigger>
                        <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer" onPress={() => feedbackHandler(variation.queryId, true)}>
                          <ThumbUp />
                        </ActionButton>
                        <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer" onPress={() => feedbackHandler(variation.queryId, false)}>
                          <ThumbDown />
                        </ActionButton>
                        <TooltipTrigger delay={0}>
                          <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer" onPress={() => copyVariationHandler(variation.id)}>
                            <Copy />
                          </ActionButton>
                          <Tooltip>Copy to Clipboard</Tooltip>
                        </TooltipTrigger>
                        <TooltipTrigger delay={0}>
                          <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer" onPress={() => deleteVariationHandler(variation.id)}>
                            <Delete />
                          </ActionButton>
                          <Tooltip>Remove Variation</Tooltip>
                        </TooltipTrigger>
                      </Flex>
                      <div style={{ width: '100%', whiteSpace: 'pre-wrap' }}
                           dangerouslySetInnerHTML={{ __html: variation.content }}/>
                    </View>
                  </CSSTransition>
                ))}
            </TransitionGroup>
          </Flex>
        </View>
      )}
    </>
  );
}

export default VariationsSection;
