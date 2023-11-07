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
import {
  Grid, Item, View, Text, Tabs, TabList, TabPanels,
} from '@adobe/react-spectrum';
import { v4 as uuidv4 } from 'uuid';

import AnnotatePen from '@spectrum-icons/workflow/AnnotatePen';
import Star from '@spectrum-icons/workflow/Star';

import {
  atom, selector, useRecoilState, useRecoilValue,
} from 'recoil';
import VariationsSection from './VariationsSection.js';
import FavoritesSection from './FavoritesSection.js';
import { LOCAL_STORAGE_KEY } from '../constants/Constants.js';
import { generationResultsState } from './GenerateButton.js';

// Function to flatten a mixed list of strings and JSON objects
const flattenMixedList = (mixedList) => {
  return mixedList.map((item) => {
    try {
      const parsedJson = JSON.parse(item);
      return parsedJson.map((jsonItem) => {
        return Object.entries(jsonItem).map(([key, value]) => `[${key}]  ${value}`).join('\n');
      });
    } catch (e) {
      return item;
    }
  }).flat();
};

const newVariationsState = selector({
  key: 'variationsState',
  get: ({ get }) => {
    return flattenMixedList(get(generationResultsState)).map((result) => ({
      id: uuidv4(),
      content: result,
      isFavorite: false,
    }));
  },
});

function ResultsView() {
  const newVariations = useRecoilValue(newVariationsState);
  const [variations, setVariations] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [tab, setTab] = useState('variations');

  // Effect to run on component mount to initialize favorites from local storage
  useEffect(() => {
    // Get the favorites from local storage
    const storedFavorites = localStorage.getItem(LOCAL_STORAGE_KEY);

    // If there are stored favorites, parse and set them as the initial state
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  useEffect(() => {
    setVariations(newVariations);
  }, [newVariations]);

  return (
    <View
      paddingLeft="15px"
      paddingRight="15px"
      width={'100%'}
      height={'100%'}
      borderWidth="thin"
      borderColor="gray-300"
      borderRadius="medium"
      overflow="auto">
      <Tabs aria-label="Tabs" width={'100%'} height="100%" selectedKey={tab} onSelectionChange={setTab}>
        <TabList>
          <Item key="variations"><AnnotatePen /><Text>Variations</Text></Item>
          <Item key="favorites"><Star /><Text>Favorites</Text></Item>
        </TabList>
        <TabPanels UNSAFE_style={{ overflow: 'auto' }}>
          <Item key="variations">
            <VariationsSection
              variations={variations}
              favorites={favorites}
              onVariationsChange={setVariations}
              onFavoritesChange={setFavorites} />
          </Item>
          <Item key="favorites">
            <FavoritesSection favorites={favorites} onChange={setFavorites} />
          </Item>
        </TabPanels>
      </Tabs>
    </View>
  );
}

export default ResultsView;
