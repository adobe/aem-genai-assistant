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
  Flex, Item, NumberField, Picker, Text, TextArea, View,
} from '@adobe/react-spectrum';
import InfoIcon from '@spectrum-icons/workflow/InfoOutline';
import React, { useCallback, useEffect } from 'react';
import { LinkLabel } from './LinkLabel.js';
import { useApplicationContext } from './ApplicationProvider.js';
import { parseSpreadSheet } from '../helpers/SpreadsheetParser.js';

function compareExpressions([a, { order: aorder }], [b, { order: border }]) {
  if (aorder < border) {
    return -1;
  } else if (aorder > border) {
    return 1;
  }
  return 0;
}

function expressionNameToLabel(name) {
  let label = name.replace(/[_-]/g, ' ');
  label = label.replace(/([a-z])([A-Z])/g, (match, p1, p2) => `${p1} ${p2}`);
  const words = label.trim().split(/\s+/);
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function getComponentLabel(name, label) {
  return label || expressionNameToLabel(name);
}

function getComponentType(params) {
  if (params.spreadsheet) {
    return 'spreadsheet';
  }
  return params.type || 'string';
}

function DescriptionLabel({ description }) {
  console.log('description', description);
  if (!description) {
    return <></>;
  }
  return (
    <Flex direction="row" gap="size-50" alignItems="center">
      <InfoIcon size="S"/>
      <Text UNSAFE_style={{ overflow: 'hidden', height: '1.3em' }}>{description}</Text>
    </Flex>
  );
}

function SpreadSheetPicker({
  name, label, description, spreadsheet, onChange,
}) {
  const { websiteUrl } = useApplicationContext();
  const [items, setItems] = React.useState([]);
  const [url, setUrl] = React.useState('');

  useEffect(() => {
    const [filename, columnName] = spreadsheet.split(':');
    const fileUrl = `${websiteUrl}/${filename || ''}.json`;
    parseSpreadSheet(fileUrl, columnName ?? 'Value')
      .then(setItems)
      .catch((error) => {
        setItems([]);
        console.error(error);
      });
    setUrl(fileUrl);
  }, [spreadsheet]);

  const selectionHandler = useCallback((selected) => {
    onChange(items[selected].value);
  }, [items, onChange]);

  return (
    <Picker
      key={name}
      label={<LinkLabel label={label} url={url}/>}
      description={<DescriptionLabel description={description} />}
      width="100%"
      items={items}
      onSelectionChange={selectionHandler}>
      {items ? items.map((item, index) => <Item key={index}>{item.key}</Item>) : []}
    </Picker>
  );
}

export function ParametersView({ expressions, state, setState }) {
  return (
    <Flex direction="column" gap="size-200" alignItems={'end'} width="100%">
      {
        Object.entries(expressions).sort(compareExpressions).map(([name, params]) => {
          if (params.comment) {
            return null;
          }
          const label = getComponentLabel(name, params.label);
          const type = getComponentType(params);
          const defaultValue = params.default;

          switch (type) {
            case 'spreadsheet':
              console.log(params);
              return (
                <SpreadSheetPicker
                  name={name}
                  label={label}
                  description={params.description}
                  spreadsheet={params.spreadsheet}
                  onChange={(value) => {
                    setState({ ...state, [name]: value });
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
                  onChange={(value) => {
                    setState({ ...state, [name]: value });
                  }}
                />
              );
            case 'string':
            default:
              return (
                <TextArea
                  key={name}
                  label={label}
                  description={<DescriptionLabel description={params.description}/>}
                  width="100%"
                  onChange={(value) => {
                    setState({ ...state, [name]: value });
                  }}
                />
              );
          }
        })
      }
    </Flex>
  );
}
