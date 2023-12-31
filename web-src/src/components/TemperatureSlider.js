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
import { useRecoilState } from 'recoil';
import {
  TEMPERATURE_MAX, TEMPERATURE_MIN, temperatureState,
} from '../state/TemperatureState.js';
import { DescriptionLabel } from './DescriptionLabel.js';

const TEMPERATURE_LABEL = 'Temperature';
const TEMPERATURE_DESC = 'A higher temperature strays from the prompt and leads to more randomness and creativity';

export function TemperatureSlider() {
  const [temperature, setTemperature] = useRecoilState(temperatureState);
  return (
    <Slider
      label="Temperature"
      contextualHelp={<DescriptionLabel label={TEMPERATURE_LABEL} description={TEMPERATURE_DESC}/>}
      minValue={TEMPERATURE_MIN}
      maxValue={TEMPERATURE_MAX}
      isFilled={true}
      step={0.1}
      width={'90%'}
      onChange={setTemperature}
      defaultValue={temperature} />
  );
}
