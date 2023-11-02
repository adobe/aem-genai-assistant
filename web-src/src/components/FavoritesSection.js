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

import React, { useState, useCallback } from 'react';
import { View, IllustratedMessage, Heading, Content, Flex, Tooltip, TooltipTrigger, ActionButton, Well, CheckboxGroup, Checkbox, ActionBarContainer, ActionBar, Item, Text } from '@adobe/react-spectrum';
import { ToastQueue } from '@react-spectrum/toast'

import Copy from '@spectrum-icons/workflow/Copy';
import Delete from '@spectrum-icons/workflow/Delete';
import Edit from '@spectrum-icons/workflow/Edit';

import WriteIcon from '../icons/WriteIcon';
import { LOCAL_STORAGE_KEY } from '../constants/Constants';

function FavoritesSection({favorites, onChange}) {
  const [selectedKeys, setSelectedKeys] = useState([]);

  // Function to copy a favorite to the clipboard
  const copyFavoriteHandler = useCallback((id) => {
    const favorite = favorites.find(favorite => favorite.id === id);
    navigator.clipboard.writeText(favorite.content);

    ToastQueue.positive('Variation copied to clipboard!', {timeout: 2000})
  }, [favorites]);

  // Function to copy all the selected favorites to the clipboard
  const copySelectedFavoritesHandler = useCallback((keys) => {
    const selectedFavorites = favorites.filter(favorite => keys.includes(favorite.id));
    const selectedFavoritesContent = selectedFavorites.map(favorite => favorite.content);
    const selectedFavoritesContentString = selectedFavoritesContent.join('\r\n');
    navigator.clipboard.writeText(selectedFavoritesContentString);

    ToastQueue.positive('Selected saved variations copied successfully!', {timeout: 2000})
  }, [favorites]);

  // Function to delete a favorite and update local storage
  const deleteFavoriteHandler = useCallback((id) => {
    // Filter out the item with the matching id
    const updatedFavorites = favorites.filter(favorite => favorite.id !== id);
    onChange(updatedFavorites);

    // Update the local storage with the new favorites
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedFavorites));
  }, [favorites]);

  // Function to delete all the selected favorites and update local storage
  const deleteSelectedFavoritesHandler = useCallback((keys) => {
    const updatedFavorites = favorites.filter(favorite => !keys.includes(favorite.id));
    onChange(updatedFavorites);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedFavorites));

    ToastQueue.positive('Selected saved variations deleted successfully!', {timeout: 2000})
  }, [favorites]);

  // Function to handle the action bar actions
  const actionCallbackHandler = useCallback((key) => {
    if (key === 'select-all') {
      setSelectedKeys(favorites.map((favorite) => favorite.id));
    } else if (key === 'copy') {
      copySelectedFavoritesHandler(selectedKeys);
    } else if (key === 'delete') {
      deleteSelectedFavoritesHandler(selectedKeys);
    }
  }, [favorites, selectedKeys]);
  
  return (
    <>
      {(favorites.length === 0) ? (
        <IllustratedMessage>
          <WriteIcon />
          <Heading>Nothing here yet</Heading>
          <Content>Favorite your generated favorites</Content>
        </IllustratedMessage>
      ) : (
        <ActionBarContainer height="size-900">
          <ActionBar
            isEmphasized
            selectedItemCount={selectedKeys.length}
            onAction={actionCallbackHandler}
            onClearSelection={() => setSelectedKeys([])}
          >
            <Item key="select-all">
              <Edit />
              <Text>Select All</Text>
            </Item>
            <Item key="copy">
              <Copy />
              <Text>Copy</Text>
            </Item>
            <Item key="delete">
              <Delete />
              <Text>Delete</Text>
            </Item>
          </ActionBar>
          <View marginTop="size-300">
            <Flex direction="column" gap="size-300">
              <CheckboxGroup value={selectedKeys} onChange={setSelectedKeys}>
                {favorites.length &&
                  favorites.map((favorite) => (
                    <View
                      paddingRight="size-300"
                      paddingBottom="size-300"
                      key={favorite.id}
                    >
                      <Flex direction="row" gap="size-100" justifyContent="right">
                        <TooltipTrigger delay={0}>
                          <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer" onPress={() => copyFavoriteHandler(favorite.id)}>
                            <Copy />
                          </ActionButton>
                          <Tooltip>Copy to Clipboard</Tooltip>
                        </TooltipTrigger>
                        <TooltipTrigger delay={0}>
                          <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer" onPress={() => deleteFavoriteHandler(favorite.id)}>
                            <Delete />
                          </ActionButton>
                          <Tooltip>Delete Saved Variation</Tooltip>
                        </TooltipTrigger>
                      </Flex>
                      <Flex direction="row" justifyContent="space-between" gap="size-10">
                        <Checkbox value={favorite.id} />
                        < Well UNSAFE_style={{ "whiteSpace": "pre-wrap" }}>{favorite.content}</Well>
                      </Flex>
                    </View>
                  ))}
              </CheckboxGroup>
            </Flex>
          </View>
        </ActionBarContainer>
      )}
    </>
  )
}

export default FavoritesSection;
