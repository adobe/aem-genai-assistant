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
import { useApplicationContext } from './ApplicationProvider.js';
import { wretchRetry } from '../../../actions/Network.js';
import { LinkLabel } from './LinkLabel.js';
import { DescriptionLabel } from './DescriptionLabel.js';

function getIndexByValue(items, value) {
  return items.findIndex((item) => item.value === value);
}

export function SpreadSheetPicker({
  name, label, description, spreadsheet, fallback, value, onChange,
}) {
  const { websiteUrl } = useApplicationContext();
  const [items, setItems] = React.useState([]);
  const [url, setUrl] = React.useState('');

  useEffect(() => {
    const [filename] = spreadsheet.split(':');
    const fileUrl = `${websiteUrl}/${filename || ''}.json`;

    wretchRetry(fileUrl).get().json()
      .then(({ data }) => {
        setItems(data.map(({ Key, Value }) => {
          return {
            key: Key,
            value: Value,
          };
        }));
        setUrl(fileUrl);
      })
      .catch((error) => {
        setItems([]);
        console.warn(`Could not load spreadsheet ${spreadsheet} and no fallback value provided`);
      });
  }, [spreadsheet]);

  const selectionHandler = useCallback((selected) => {
    onChange(items[selected].value);
  }, [items, onChange]);

  if (items.length === 0) {
    return fallback;
  }

  return (
    <Picker
      label={<LinkLabel label={label} url={url}/>}
      contextualHelp={<DescriptionLabel description={description} />}
      width="100%"
      items={items}
      selectedKey={String(getIndexByValue(items, value))}
      onSelectionChange={selectionHandler}>
      {items ? items.map((item, index) => <Item key={index}>{item.key}</Item>) : []}
    </Picker>
  );
}
