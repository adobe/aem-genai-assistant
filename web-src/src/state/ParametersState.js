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
import { selector } from 'recoil';
import { placeholdersState } from './PlaceholdersState.js';
import { sessionState } from './SessionState.js';

export const parametersState = selector({
  key: 'parametersState',
  default: {},
  get: ({ get }) => {
    const { parameters } = get(sessionState);
    const placeholders = get(placeholdersState);
    const newParameters = { ...parameters };
    Object.entries(placeholders).forEach(([name, params]) => {
      if (newParameters[name] === undefined && params.default !== undefined) {
        newParameters[name] = params.default;
      }
    });
    return newParameters;
  },
  set: ({ set, get }, newValue) => {
    set(sessionState, {
      ...get(sessionState),
      parameters: newValue,
    });
  },
});
