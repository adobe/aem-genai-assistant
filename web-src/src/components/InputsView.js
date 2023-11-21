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
import React, { useCallback, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { placeholdersState } from '../state/PlaceholdersState.js';
import { parametersState } from '../state/ParametersState.js';
import { TemperatureSlider } from './TemperatureSlider.js';
import { SpreadSheetPicker } from './SpreadSheetPicker.js';
import { DescriptionLabel } from './DescriptionLabel.js';
import { formatIdentifier } from '../helpers/FormatHelper.js';

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
  if (params.spreadsheet) {
    return 'select';
  }
  return params.type || 'text';
}

function createTextComponent(name, label, params, value, onChange) {
  return (
    <TextArea
      key={name}
      label={label}
      description={<DescriptionLabel description={params.description}/>}
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
      description={<DescriptionLabel description={params.description}/>}
      width="100%"
      value={value}
      minValue={0}
      onChange={(newValue) => onChange(name, newValue)}
    />
  );
}

function createSelectComponent(name, label, params, value, onChange) {
  return (
    <SpreadSheetPicker
      name={name}
      label={label}
      description={params.description}
      spreadsheet={params.spreadsheet}
      fallback={createTextComponent(name, label, params, value, onChange)}
      value={value}
      onChange={(newValue) => onChange(name, newValue)}
    />
  );
}

function createInputComponent(type, name, label, params, value, onChange) {
  switch (type) {
    case 'select':
      return createSelectComponent(name, label, params, value, onChange);
    case 'number':
      return createNumberComponent(name, label, params, value, onChange);
    case 'text':
    default:
      return createTextComponent(name, label, params, value, onChange);
  }
}

export function InputsView({ gridColumn }) {
  const placeholders = useRecoilValue(placeholdersState);
  const [parameters, setParameters] = useRecoilState(parametersState);

  useEffect(() => {
    setParameters({});
  }, [placeholders]);

  const onChange = useCallback((name, value) => {
    setParameters({ ...parameters, [name]: value });
  }, [parameters, setParameters]);

  return (
    <Flex
      direction="column"
      gap="size-100"
      alignItems={'end'}
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
      <TemperatureSlider/>
    </Flex>
  );
}
