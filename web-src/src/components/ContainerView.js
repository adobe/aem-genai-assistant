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

import React, { useEffect, useState } from 'react';
import { Grid, View, Tabs, TabList, TabPanels, Item, Text } from '@adobe/react-spectrum';
import { ToastQueue } from '@react-spectrum/toast'

import AnnotatePen from '@spectrum-icons/workflow/AnnotatePen';
import Star from '@spectrum-icons/workflow/Star';

import Editor from './Editor';
import VariationsSection from './VariationsSection';
import FavoritesSection from './FavoritesSection';
import { MOCK_VARIATIONS, LOCAL_STORAGE_KEY } from '../constants/Constants';

function ContainerView() {
  const [variations, setVariations] = useState(MOCK_VARIATIONS);
  const [favorites, setFavorites] = useState([]);

  // Effect to run on component mount to initialize favorites from local storage
  useEffect(() => {
    // Get the favorites from local storage
    const storedFavorites = localStorage.getItem(LOCAL_STORAGE_KEY);

    // If there are stored favorites, parse and set them as the initial state
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  // Function to add a favorite and update local storage
  const addFavorite = (item) => {
    if (isAlreadyFavorite(item.id)) {
      return;
    }
    
    // Add the item to the favorites state
    const updatedFavorites = [...favorites, item];
    setFavorites(updatedFavorites);

    // Update the local storage with the new favorites
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedFavorites));
  };

  // Function to delete a favorite and update local storage
  const deleteFavorite = (id) => {
    // Filter out the item with the matching id
    const updatedFavorites = favorites.filter(favorite => favorite.id !== id);
    setFavorites(updatedFavorites);

    // Update the local storage with the new favorites
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedFavorites));
  };

  // Function to delete all the selected favorites and update local storage
  const deleteSelectedFavorites = (keys) => {
    const updatedFavorites = favorites.filter(favorite => !keys.includes(favorite.id));
    setFavorites(updatedFavorites);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedFavorites));

    ToastQueue.positive('Selected saved variations deleted successfully!', {timeout: 2000})
  };

  // Function to check if a variation is a favorite and return boolean
  const isAlreadyFavorite = (id) => {
    const storedFavorites = localStorage.getItem(LOCAL_STORAGE_KEY);
    const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    const favorite = favorites.find(favorite => favorite.id === id);
    
    return favorite ? true : false;
  }

  const favoriteVariation = (id) => {
    const updatedVariations = variations.map(variation => {
      if (variation.id === id) {
        variation.isFavorite = true;
        addFavorite(variation);
      }
      return variation;
    });
    setVariations(updatedVariations);
  }

  const copyVariation = (id) => {
    const variation = variations.find(variation => variation.id === id);
    navigator.clipboard.writeText(variation.content);

    ToastQueue.positive('Variation copied to clipboard!', {timeout: 2000})
  }

  const copyFavorite = (id) => {
    const favorite = favorites.find(favorite => favorite.id === id);
    navigator.clipboard.writeText(favorite.content);

    ToastQueue.positive('Variation copied to clipboard!', {timeout: 2000})
  }

  const copySelectedFavorites = (keys) => {
    const selectedFavorites = favorites.filter(favorite => keys.includes(favorite.id));
    const selectedFavoritesContent = selectedFavorites.map(favorite => favorite.content);
    const selectedFavoritesContentString = selectedFavoritesContent.join('\r\n');
    navigator.clipboard.writeText(selectedFavoritesContentString);

    ToastQueue.positive('Selected saved variations copied successfully!', {timeout: 2000})
  }

  const deleteVariation = (id) => {
    const updatedVariations = variations.filter(variation => variation.id !== id);
    setVariations(updatedVariations);
  };

  return (
    <Grid
      areas={[
        'prompt variations',
      ]}
      columns={['2fr', '1.5fr']}
      rows={['auto']}
      height="100%"
      >
      <View gridArea="prompt" UNSAFE_style={{"paddingRight": "30px"}}>
        <Editor />
      </View>
      <View gridArea="variations" paddingLeft="30px" borderWidth="thick" borderColor="gray-300" borderRadius="medium" overflow="auto">
        <Tabs aria-label="Tabs" height="100%">
          <TabList>
            <Item key="variations"><AnnotatePen /><Text>Variations</Text></Item>
            <Item key="favorites"><Star /><Text>Favorites</Text></Item>
          </TabList>
          <TabPanels UNSAFE_style={{"overflow": "auto"}}>
            <Item key="variations">
              <VariationsSection variations={variations} onFavorite={favoriteVariation} onCopy={copyVariation} onDelete={deleteVariation}/>
            </Item>
            <Item key="favorites">
              <FavoritesSection favorites={favorites} onCopy={copyFavorite} onDelete={deleteFavorite} onBulkCopy= {copySelectedFavorites} onBulkDelete={deleteSelectedFavorites}/>
            </Item>
          </TabPanels>
        </Tabs>
      </View>
    </Grid>
  )
};

export default ContainerView;
