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
import { Slider } from '@adobe/react-spectrum';
import React from 'react';
import { atom, useRecoilState } from 'recoil';

const CREATIVITY_LABELS = [
  'Conventional',
  'Balanced',
  'Innovator',
  'Visionary',
];

const TEMPERATURE_MIN = 0.0;
const TEMPERATURE_MAX = 0.9;
const TEMPERATURE_STEP = 0.30;
const DEFAULT_TEMPERATURE = 0.30;

export const temperatureState = atom({
  key: 'temperatureState',
  default: DEFAULT_TEMPERATURE,
});

export function CreativitySelector() {
  const [temperature, setTemperature] = useRecoilState(temperatureState);
  return (
    <Slider
      UNSAFE_className="creativity-slider"
      label="Creativity"
      minValue={TEMPERATURE_MIN}
      maxValue={TEMPERATURE_MAX}
      step={TEMPERATURE_STEP}
      getValueLabel={(value) => CREATIVITY_LABELS[value / TEMPERATURE_STEP]}
      onChange={setTemperature}
      defaultValue={temperature} />
  );
}
