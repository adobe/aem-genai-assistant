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

import React, { useEffect, useRef } from 'react';
import { View, IllustratedMessage, Heading, Content, Flex, Tooltip, TooltipTrigger, ActionButton, Well } from '@adobe/react-spectrum';
import { ToastQueue } from '@react-spectrum/toast'

import Star from '@spectrum-icons/workflow/Star';
import StarOutline from '@spectrum-icons/workflow/StarOutline';
import Copy from '@spectrum-icons/workflow/Copy';
import Delete from '@spectrum-icons/workflow/Delete';

import WriteIcon from '../icons/WriteIcon';
import { LOCAL_STORAGE_KEY } from '../constants/Constants';

function VariationsSection({variations, favorites, onVariationsChange, onFavoritesChange}) {
  const scrollView = useRef(null);

  // useEffect(() => {
  //   if (variations) {
  //     const scrollable = scrollView.current && scrollView.current.UNSAFE_getDOMNode();
  //     scrollable.style.animation = "slide-in 0.5s forwards, fade-in 1s forwards";
  //     scrollable.style.transform = "translateY(50%)";
  //     if (variations.length > 0) {
  //       scrollable.scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"});
  //     }
  //   }
  // }, [variations]);

  // Function to add a favorite and update local storage
  const favoriteVariation = (id) => {
    const updatedVariations = variations.map(variation => {
      if (variation.id === id) {
        variation.isFavorite = true;
        addFavorite(variation);
      }
      return variation;
    });
    onVariationsChange(updatedVariations);
  }

  // Function to copy a variation to the clipboard
  const copyVariation = (id) => {
    const variation = variations.find(variation => variation.id === id);
    navigator.clipboard.writeText(variation.content);

    ToastQueue.positive('Variation copied to clipboard!', {timeout: 2000})
  }

  // Function to delete a variation
  const deleteVariation = (id) => {
    const updatedVariations = variations.filter(variation => variation.id !== id);
    onVariationsChange(updatedVariations);
  };

  // Function to add a favorite and update local storage
  const addFavorite = (item) => {
    if (isAlreadyFavorite(item.id)) {
      return;
    }
    
    // Add the item to the favorites state
    const updatedFavorites = [...favorites, item];
    onFavoritesChange(updatedFavorites);

    // Update the local storage with the new favorites
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedFavorites));
  };

  // Function to check if a variation is a favorite and return boolean
  const isAlreadyFavorite = (id) => {
    const storedFavorites = localStorage.getItem(LOCAL_STORAGE_KEY);
    const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    const favorite = favorites.find(favorite => favorite.id === id);
    
    return favorite ? true : false;
  }

  return (
    <>
      {(variations.length === 0) ? (
        <IllustratedMessage>
          <WriteIcon />
          <Heading>Nothing here yet</Heading>
          <Content>Set up your prompt to generate new variations</Content>
        </IllustratedMessage>
      ) : (
        <View marginTop="size-300" marginBottom="size-300">
          <Flex direction="column" gap="size-300">
            {variations.length &&
              variations.map((variation) => (
                <View ref={scrollView}
                  borderRadius="regular"
                  paddingRight="24px"
                  key={variation.id}
                >
                  <Flex direction="row" gap="size-100" justifyContent="right">
                    <TooltipTrigger delay={0}>
                      <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer" onPress={() => favoriteVariation(variation.id)}>
                        {variation.isFavorite ? <Star /> : <StarOutline />}
                      </ActionButton>
                      <Tooltip>Save Variation</Tooltip>
                    </TooltipTrigger>
                    <TooltipTrigger delay={0}>
                      <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer" onPress={() => copyVariation(variation.id)}>
                        <Copy />
                      </ActionButton>
                      <Tooltip>Copy to Clipboard</Tooltip>
                    </TooltipTrigger>
                    <TooltipTrigger delay={0}>
                      <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer" onPress={() => deleteVariation(variation.id)}>
                        <Delete />
                      </ActionButton>
                      <Tooltip>Remove Variation</Tooltip>
                    </TooltipTrigger>
                  </Flex>
                  <Well UNSAFE_style={{ "whiteSpace": "pre-wrap" }}>{variation.content}</Well>
                </View>
              ))}
          </Flex>
        </View>
      )}
    </>
  )
}

export default VariationsSection;
