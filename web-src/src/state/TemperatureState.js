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
import { atom } from 'recoil';

export const TEMPERATURE_MIN = 0.0;
export const TEMPERATURE_MAX = 1.21;
const DEFAULT_TEMPERATURE = 1.0;

export const temperatureState = atom({
  key: 'temperatureState',
  default: DEFAULT_TEMPERATURE,
});
