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
import React, { useCallback, useEffect } from 'react';
import { Item, Picker } from '@adobe/react-spectrum';
import { LinkLabel } from './LinkLabel.js';
import { DescriptionLabel } from './DescriptionLabel.js';

function getIndexByValue(items, value) {
  return items.findIndex((item) => item.value === value);
}

export function SpreadSheetPicker({
  name, label, description, dataProvider, fallback, value, onChange,
}) {
  const [items, setItems] = React.useState([]);
  const [url, setUrl] = React.useState('');

  useEffect(() => {
    dataProvider()
      .then((data) => {
        setItems(data);
        console.log(`Loaded data for ${name}: ${data}`);
      })
      .catch((error) => {
        setItems([]);
        console.warn(`Could not load data for ${name}: ${error}`);
      });
  }, [dataProvider]);

  const selectionHandler = useCallback((selected) => {
    onChange(items[selected].value);
  }, [items, onChange]);

  if (items.length === 0) {
    return fallback;
  }

  return (
    <Picker
      label={<LinkLabel label={label} url={url}/>}
      contextualHelp={<DescriptionLabel label={label} description={description} />}
      width="100%"
      placeholder={'Select a value'}
      items={items}
      selectedKey={String(getIndexByValue(items, value))}
      onSelectionChange={selectionHandler}>
      {items ? items.map((item, index) => <Item key={index}>{item.key}</Item>) : []}
    </Picker>
  );
}
