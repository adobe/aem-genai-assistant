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
import React, { useCallback, useEffect, useState } from 'react';
import {
  Item, LabeledValue, Picker, Text, ToggleButton,
} from '@adobe/react-spectrum';
import { ToastQueue } from '@react-spectrum/toast';
import { css } from '@emotion/css';
import { useApplicationContext } from './ApplicationProvider.js';
import { DescriptionLabel } from './DescriptionLabel.js';
import { log } from '../helpers/MetricsHelper.js';

const DATA_SOURCES = {
  CSV: 'csv',
  TARGET: 'target',
};

const styles = {
  toggleButtons: css`
    display: grid;
    grid-auto-columns: 1fr 1fr;
    justify-items: stretch;
    column-gap: 10px;
    width: 100%;
  `,
};

export function isTargetEnabled(adobeTarget) {
  return /^(true|1|yes)$/i.test(adobeTarget?.toString().trim());
}

export function useGetItemsFromTarget() {
  const { targetService } = useApplicationContext();
  return useCallback(async () => {
    const audiences = await targetService.getAudiences();
    return audiences
      .sort((a, b) => {
        if (a.description && !b.description) {
          return -1;
        } else if (!a.description && b.description) {
          return 1;
        }
        return 0;
      })
      .map((audience) => {
        return {
          key: audience.name,
          value: audience.description,
        };
      });
  }, [targetService]);
}

function useGetItemsFromCsvFile() {
  const { csvParserService } = useApplicationContext();
  return useCallback(async (url) => {
    return csvParserService.getData(url);
  }, [csvParserService]);
}

function DataSourceSelector({ dataSource, setDataSource }) {
  const handleDataSourceChange = useCallback((newDataSource) => {
    log('prompt:inputs:audienceSelector:datasource:changed', { dataSource: newDataSource });
    setDataSource(newDataSource);
  }, []);

  return (
    <div className={styles.toggleButtons}>
      <LabeledValue label={'Audiences Source'} value={''} gridColumnStart={1} gridColumnEnd={3} />
      <ToggleButton
        isSelected={dataSource === DATA_SOURCES.TARGET}
        onChange={() => handleDataSourceChange(DATA_SOURCES.TARGET)}>Adobe Target</ToggleButton>
      <ToggleButton
        isSelected={dataSource === DATA_SOURCES.CSV}
        onChange={() => handleDataSourceChange(DATA_SOURCES.CSV)}>CSV file</ToggleButton>
    </div>
  );
}

export function AudienceSelector({
  name, label, params: { description, csv, adobeTarget }, value, onChange,
}) {
  const getItemsFromTarget = useGetItemsFromTarget();
  const getItemsFromCsvFile = useGetItemsFromCsvFile();
  const [dataSource, setDataSource] = useState();
  const [items, setItems] = React.useState([]);
  const [disabledKeys, setDisabledKeys] = React.useState([]);

  useEffect(() => {
    setItems([]);
    if (isTargetEnabled(adobeTarget) && !csv) {
      setDataSource(DATA_SOURCES.TARGET);
    } else if (csv && !isTargetEnabled(adobeTarget)) {
      setDataSource(DATA_SOURCES.CSV);
    }
    if (dataSource === DATA_SOURCES.CSV) {
      getItemsFromCsvFile(csv)
        .then(setItems)
        .catch((err) => {
          console.error(err);
          ToastQueue.negative(`Failed to parse CSV ${csv}`, { timeout: 1000 });
          setItems([]);
        });
    } else if (dataSource === DATA_SOURCES.TARGET) {
      getItemsFromTarget()
        .then(setItems)
        .catch((err) => {
          console.error(err);
          ToastQueue.negative('Failed to load from Adobe Target', { timeout: 1000 });
          setItems([]);
        });
    }
    onChange(name, null);
  }, [adobeTarget, csv, dataSource, setDataSource, setItems, getItemsFromCsvFile, getItemsFromTarget]);

  useEffect(() => {
    setDisabledKeys(items.reduce((acc, item, index) => {
      if (!item.value) {
        return [...acc, String(index)];
      }
      return acc;
    }, []));
  }, [items, setDisabledKeys]);

  const getSelectedKey = useCallback((selectedValue) => {
    return String(items.findIndex((item) => item.value === selectedValue));
  }, [items, value]);

  const handleSelection = useCallback((selected) => {
    onChange(name, items[selected].value);
  }, [name, items, onChange]);

  const renderItems = useCallback(() => {
    return items.map((item, index) => {
      return (
        <Item key={index} textValue={item.key}>
          <Text>{item.key}</Text>
          {disabledKeys.includes(String(index)) && <Text slot="description">Not available</Text>}
        </Item>
      );
    });
  }, [items, disabledKeys]);

  const pickerPlaceholder = dataSource
    ? `Select from ${dataSource === DATA_SOURCES.TARGET ? 'Adobe Target' : 'CSV file'}`
    : 'Select a source';

  return (
    <>
      { (adobeTarget && csv)
        && <DataSourceSelector
          label={label}
          dataSource={dataSource}
          setDataSource={setDataSource}
        />
      }
      <Picker
        key={name}
        label={label}
        contextualHelp={<DescriptionLabel label={label} description={description} />}
        width="100%"
        placeholder={pickerPlaceholder}
        items={items}
        isDisabled={!items.length}
        selectedKey={getSelectedKey(value)}
        disabledKeys={disabledKeys}
        onSelectionChange={handleSelection}>
        {renderItems()}
      </Picker>
    </>
  );
}
