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
import React, { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { placeholdersState } from '../state/PlaceholdersState.js';
import { parametersState } from '../state/ParametersState.js';
import { TemperatureSlider } from './TemperatureSlider.js';
import { SpreadSheetPicker } from './SpreadSheetPicker.js';
import { DescriptionLabel } from './DescriptionLabel.js';

function comparePlaceholders([a, { order: aorder }], [b, { order: border }]) {
  if (aorder < border) {
    return -1;
  } else if (aorder > border) {
    return 1;
  }
  return 0;
}

function placeholderNameToLabel(name) {
  let label = name.replace(/[_-]/g, ' ');
  label = label.replace(/([a-z])([A-Z])/g, (match, p1, p2) => `${p1} ${p2}`);
  const words = label.trim().split(/\s+/);
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function getComponentLabel(name, label) {
  return label || placeholderNameToLabel(name);
}

function getComponentType(params) {
  if (params.spreadsheet) {
    return 'select';
  }
  return params.type || 'text';
}

export function InputsView({ gridColumn }) {
  const placeholders = useRecoilValue(placeholdersState);
  const [parameters, setParameters] = useRecoilState(parametersState);

  useEffect(() => {
    setParameters({});
  }, [placeholders]);

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
          const parameterValue = parameters[name] ?? '';

          switch (type) {
            case 'select':
              return (
                <SpreadSheetPicker
                  name={name}
                  label={label}
                  description={params.description}
                  spreadsheet={params.spreadsheet}
                  value={parameterValue}
                  onChange={(value) => {
                    setParameters({ ...parameters, [name]: value });
                  }}
                />
              );
            case 'number':
              return (
                <NumberField
                  key={name}
                  label={label}
                  description={<DescriptionLabel description={params.description}/>}
                  width="100%"
                  value={parameterValue}
                  minValue={0}
                  onChange={(value) => {
                    setParameters({ ...parameters, [name]: value });
                  }}
                />
              );
            case 'text':
            default:
              return (
                <TextArea
                  key={name}
                  label={label}
                  description={<DescriptionLabel description={params.description}/>}
                  width="100%"
                  value={parameterValue}
                  onChange={(value) => {
                    setParameters({ ...parameters, [name]: value });
                  }}
                />
              );
          }
        })
      }
      <TemperatureSlider/>
    </Flex>
  );
}
