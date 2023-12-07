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

import { useApplicationContext } from '../components/ApplicationProvider.js';

export const createRemotePersistenceEffect = (key) => ({ setSelf, onSet }) => {
  // Flag to indicate if the setSelf was called for initialization
  let isInitializing = true;
  const { remoteFavoritesService } = useApplicationContext();

  // load the favorites from the API when the atom is used
  remoteFavoritesService.get_favorites()
    .then((favs) => {
      if (favs != null) {
        const favsData = favs.data;
        // remove items from favsData that have the same "id" value
        const uniqueFavs = favsData.filter((item, index, self) => index === self.findIndex((t) => (
          t.id === item.id
        )));
        // for each item in uniqueFavs, covert "content" field from string to json
        uniqueFavs.forEach((item) => {
          // eslint-disable-next-line no-param-reassign
          item.content = JSON.parse(item.content);
        });
        setSelf(uniqueFavs);
        isInitializing = false;
      }
    })
    .catch((error) => console.error('Error loading favorites:', error));

  // save the favorites to the API when the atom is updated
  onSet(async (newValue, _, isReset) => {
    // if newValue's array length is 0, then do return
    if (newValue.length === 0) {
      return;
    }
    if (isReset) {
      return;
    }

    if (isInitializing) {
      return;
    }

    // remove items from favs that have the same "id" value
    const favs = newValue;
    const uniqueFavs = favs.filter((item, index, self) => index === self.findIndex((t) => (
      t.id === item.id
    )));

    console.log('Favorites to be stored:', favs);
    await remoteFavoritesService.save_favorite(favs)
      .then((response) => response)
      .then((data) => console.log('Favorites updated in API:', data))
      .catch((error) => console.error('Error updating favorites:', error));
  });
};
