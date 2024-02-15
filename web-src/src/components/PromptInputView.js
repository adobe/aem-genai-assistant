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
import QueryStringAddon from 'wretch/addons/queryString';
import { placeholdersState } from '../state/PlaceholdersState.js';
import { parametersState } from '../state/ParametersState.js';
import { TemperatureSlider } from './TemperatureSlider.js';
import { SpreadSheetPicker } from './SpreadSheetPicker.js';
import { DescriptionLabel } from './DescriptionLabel.js';
import { formatIdentifier } from '../helpers/FormatHelper.js';
import { wretchRetry } from '../../../actions/Network.js';
import { useApplicationContext } from './ApplicationProvider.js';

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

function useDataProvider() {
  const {
    websiteUrl, accessToken, imsTenant, targetEndpoint, csvParserEndpoint,
  } = useApplicationContext();
  return useCallback((params) => {
    if (params.spreadsheet) {
      return async () => {
        const filename = params.spreadsheet;
        const fileUrl = `${websiteUrl}/${filename || ''}.json`;
        const { data } = await wretchRetry(fileUrl).get().json();
        return Array.from(data).map((row) => {
          return {
            key: row.Key,
            value: row.Value,
          };
        });
      };
    } else if (params.csv) {
      return async () => {
        const url = params.csv;
        const json = await wretchRetry(csvParserEndpoint)
          .addon(QueryStringAddon)
          .query({ csv: url })
          .get()
          .json();
        console.log(`CSV data: ${JSON.stringify(json)}`);
        return Array.from(json).map(([key, value]) => {
          return {
            key,
            value,
          };
        });
      };
    } else if (params.target) {
      return async () => {
        const url = `${targetEndpoint}?org=${params.target === 'default' ? imsTenant : params.target}`;
        const audiences = await wretchRetry(url)
          .auth(`Bearer ${accessToken}`)
          .accept('application/json')
          .get()
          .json();
        console.log(audiences);
        return audiences.map((audience) => {
          return {
            key: audience.name.trim(),
            value: audience.description.trim(),
          };
        });
      };
    } else if (params.keys && params.values) {
      const keys = params.keys.split(',').map((key) => key.trim());
      const values = params.values.split(',').map((value) => value.trim());
      return () => Promise.resolve(keys.map((key, index) => {
        return {
          key,
          value: values[index],
        };
      }));
    } else if (params.values) {
      return () => Promise.resolve(params.values.split(',').map((value) => value.trim()).map((value) => {
        return {
          key: value,
          value,
        };
      }));
    }
    return () => Promise.resolve([]);
  }, [websiteUrl]);
}

function createSelectComponent(name, label, params, value, onChange, dataProvider) {
  return (
    <SpreadSheetPicker
      key={name}
      name={name}
      label={label}
      description={params.description}
      fallback={createTextComponent(name, label, params, value, onChange)}
      value={value}
      dataProvider={dataProvider(params)}
      onChange={(newValue) => onChange(name, newValue)}
    />
  );
}

function createInputComponent(type, name, label, params, value, onChange, dataProvider) {
  switch (type) {
    case 'select':
      return createSelectComponent(name, label, params, value, onChange, dataProvider);
    case 'number':
      return createNumberComponent(name, label, params, value, onChange);
    case 'text':
    default:
      return createTextComponent(name, label, params, value, onChange);
  }
}

export function PromptInputView({ gridColumn }) {
  const { websiteUrl } = useApplicationContext();
  const dataProvider = useDataProvider();
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

          return createInputComponent(type, name, label, params, value, onChange, dataProvider);
        })
      }
      <h3 style={{ alignSelf: 'start', marginBottom: '10px' }}>Advanced</h3>
      <TemperatureSlider/>
    </Flex>
  );
}
