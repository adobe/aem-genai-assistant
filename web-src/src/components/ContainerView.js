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
              <VariationsSection variations={variations} favorites={favorites} onVariationsChange={setVariations} onFavoritesChange={setFavorites} />
            </Item>
            <Item key="favorites">
              <FavoritesSection favorites={favorites} onChange={setFavorites} />
            </Item>
          </TabPanels>
        </Tabs>
      </View>
    </Grid>
  )
};

export default ContainerView;
