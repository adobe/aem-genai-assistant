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

export const createRemotePersistenceEffect = (key) => ({ onSet }) => {
  const { remoteFavoritesService } = useApplicationContext();
  onSet((newValue) => {
    // if newValue's array length is 0, then do return
    if (newValue.length === 0) {
      return;
    }

    console.log('Favorites to be stored:', newValue);
    remoteFavoritesService.save_favorite(newValue)
      .then((response) => response)
      .then((data) => console.log('Favorites updated in API:', data))
      .catch((error) => console.error('Error updating favorites:', error));
  });
};
