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

function ContainerView() {
  const mockVariations = [
    {
      id: 1,
      content: "Greetings from the digital realm! As software engineers, we craft the virtual world with lines of code and algorithms, shaping the future one byte at a time.",
      isFavorite: false,
    },
    {
      id: 2,
      content: "Salutations, fellow programmers! In the ever-expanding universe of technology, our code serves as the stars illuminating the path to innovation and progress.",
      isFavorite: false,
    },
    {
      id: 3,
      content: "Code, conquer, and create! With each keystroke, we unlock the potential of the digital domain, bringing ideas to life and solving complex problems with elegance and precision.",
      isFavorite: false,
    },
    {
      id: 4,
      content: "Software engineering magic at your service! Our spells are written in C++, Python, and JavaScript, transforming dreams into reality and bugs into oblivion.",
      isFavorite: false,
    },
    {
      id: 5,
      content: "May your code compile flawlessly! As we navigate the labyrinth of programming, let our algorithms be optimized, and our syntax be error-free. Happy coding!",
      isFavorite: false,
    },
    {
      id: 6,
      content: "Hello, fellow code wranglers! With our keyboards as lassos, we tame the digital frontier, creating innovative solutions and embracing the wild world of software.",
      isFavorite: false,
    },
    {
      id: 7,
      content: "Greetings, code sorcerers! Our code incantations breathe life into machines, conjuring software solutions from the depths of logic and creativity.",
      isFavorite: false,
    },
    {
      id: 8,
      content: "Hey there, tech virtuosos! In this symphony of 1s and 0s, we are the composers, crafting software masterpieces that resonate with functionality and elegance.",
      isFavorite: false,
    },
    {
      id: 9,
      content: "Hello from the world of coding! We are the architects of the virtual universe, building structures of data and logic that shape the modern digital landscape.",
      isFavorite: false,
    },
    {
      id: 10,
      content: "Salutations, code architects! With our keystrokes, we design the blueprints of the digital age, constructing solutions that stand the test of time and technology.",
      isFavorite: false,
    },
  ];


  const [variations, setVariations] = useState(mockVariations);
  const [favorites, setFavorites] = useState([]);

  // Define a key for the local storage
  const localStorageKey = 'favorite-variations';

  // Effect to run on component mount to initialize favorites from local storage
  useEffect(() => {
    // Get the favorites from local storage
    const storedFavorites = localStorage.getItem(localStorageKey);

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
    localStorage.setItem(localStorageKey, JSON.stringify(updatedFavorites));
  };

  // Function to delete a favorite and update local storage
  const deleteFavorite = (id) => {
    // Filter out the item with the matching id
    const updatedFavorites = favorites.filter(favorite => favorite.id !== id);
    setFavorites(updatedFavorites);

    // Update the local storage with the new favorites
    localStorage.setItem(localStorageKey, JSON.stringify(updatedFavorites));
  };

  // Function to delete all the selected favorites and update local storage
  const deleteSelectedFavorites = (keys) => {
    const updatedFavorites = favorites.filter(favorite => !keys.includes(favorite.id));
    setFavorites(updatedFavorites);
    localStorage.setItem(localStorageKey, JSON.stringify(updatedFavorites));

    ToastQueue.positive('Selected saved variations deleted successfully!', {timeout: 2000})
  };

  // Function to check if a variation is a favorite and return boolean
  const isAlreadyFavorite = (id) => {
    const storedFavorites = localStorage.getItem(localStorageKey);
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
