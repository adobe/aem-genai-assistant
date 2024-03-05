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
  Flex, NumberField, TextArea,
} from '@adobe/react-spectrum';
import React, { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { placeholdersState } from '../state/PlaceholdersState.js';
import { parametersState } from '../state/ParametersState.js';
import { TemperatureSlider } from './TemperatureSlider.js';
import { DescriptionLabel } from './DescriptionLabel.js';
import { formatIdentifier } from '../helpers/FormatHelper.js';
import { AudienceSelector } from './AudienceSelector.js';

function comparePlaceholders([a, { order: aorder }], [b, { order: border }]) {
  if (aorder < border) {
    return -1;
  } else if (aorder > border) {
    return 1;
  }
  return 0;
}

function getComponentLabel(name, label) {
  return label || formatIdentifier(name);
}

function getComponentType(params) {
  return params.type || 'text';
}

function createTextComponent(name, label, params, value, onChange) {
  return (
    <TextArea
      key={name}
      label={label}
      contextualHelp={<DescriptionLabel label={label} description={params.description}/>}
      width="100%"
      value={value}
      onChange={(newValue) => onChange(name, newValue)}
    />
  );
}

function createNumberComponent(name, label, params, value, onChange) {
  return (
    <NumberField
      key={name}
      label={label}
      contextualHelp={<DescriptionLabel label={label} description={params.description}/>}
      width="100%"
      value={value}
      minValue={0}
      onChange={(newValue) => onChange(name, newValue)}
    />
  );
}

function createAudienceSelectComponent(name, label, params, value, onChange) {
  return (
    <AudienceSelector
      key={name}
      name={name}
      label={label}
      params={params}
      value={value}
      onChange={onChange}
    />
  );
}

function createInputComponent(type, name, label, params, value, onChange) {
  switch (type) {
    case 'audience':
      return createAudienceSelectComponent(name, label, params, value, onChange);
    case 'number':
      return createNumberComponent(name, label, params, value, onChange);
    case 'text':
    default:
      return createTextComponent(name, label, params, value, onChange);
  }
}

export function PromptInputView({ gridColumn }) {
  const placeholders = useRecoilValue(placeholdersState);
  const [parameters, setParameters] = useRecoilState(parametersState);

  const onChange = useCallback((name, value) => {
    setParameters({ ...parameters, [name]: value });
  }, [parameters, setParameters]);

  return (
    <Flex
      direction="column"
      gap="size-100"
      alignItems={'start'}
      gridColumn={gridColumn}
      UNSAFE_style={{
        overflowY: 'auto', position: 'absolute', top: '0', bottom: '0',
      }}
      width={'100%'}>
      {
        Object.entries(placeholders).sort(comparePlaceholders).map(([name, params]) => {
          if (params.comment) {
            return null;
          }
          const label = getComponentLabel(name, params.label);
          const type = getComponentType(params);
          const value = parameters[name] ?? '';

          return createInputComponent(type, name, label, params, value, onChange);
        })
      }
      <h3 style={{ alignSelf: 'start', marginBottom: '10px' }}>Advanced</h3>
      <TemperatureSlider/>
    </Flex>
  );
}
