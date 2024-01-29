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
import { useSetRecoilState } from 'recoil';
import { useCallback } from 'react';
import { useIsFavorite } from './IsFavoriteHook.js';
import { favoritesState } from './FavoritesState.js';

export function useToggleFavorite() {
  const isFavorite = useIsFavorite();
  const setFavorites = useSetRecoilState(favoritesState);

  return useCallback((variant) => {
    setFavorites((favorites) => {
      if (isFavorite(variant)) {
        return favorites.filter((favorite) => favorite.id !== variant.id);
      } else {
        return [...favorites, variant];
      }
    });
  }, [isFavorite, setFavorites]);
}
