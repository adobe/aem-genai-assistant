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
  Grid, Heading, View, Text,
} from '@adobe/react-spectrum';
import React from 'react';
import { useRecoilValue } from 'recoil';

import { favoritesState } from '../state/FavoritesState.js';
import { FavoriteVariantCard } from './FavoriteVariantCard.js';

export function FavoriteVariantListPanel(props) {
  const favorites = useRecoilValue(favoritesState);

  return (
    <View
      padding={'size-400'}
      height={'100%'}
      overflow={'auto'}>
      <Heading level={4} alignSelf={'start'}>Favorites</Heading>
      <Grid
        width={'100%'}
        alignItems={'start'}
        rows={'repeat(auto-fill, minmax(200px, 1fr))'}
        columns={'repeat(auto-fill, minmax(350px, 1fr))'} gap={'size-200'}>
        { favorites.length === 0
          ? <Text>No favorites yet</Text>
          : favorites.map((variant) => <FavoriteVariantCard key={variant.id} variant={variant} />) }
      </Grid>
    </View>
  );
}
