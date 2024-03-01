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
  Flex, Item, NumberField, Picker, TextArea, ToggleButton, LabeledValue,
} from '@adobe/react-spectrum';
import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import QueryStringAddon from 'wretch/addons/queryString';
import { css } from '@emotion/css';
import { ToastQueue } from '@react-spectrum/toast';
import { placeholdersState } from '../state/PlaceholdersState.js';
import { parametersState } from '../state/ParametersState.js';
import { TemperatureSlider } from './TemperatureSlider.js';
import { DescriptionLabel } from './DescriptionLabel.js';
import { formatIdentifier } from '../helpers/FormatHelper.js';
import { wretchRetry } from '../../../actions/Network.js';
import { useApplicationContext } from './ApplicationProvider.js';

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
  if (params.target || params.csv) {
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

function useParseCsv() {
  const { csvParserEndpoint } = useApplicationContext();
  return useCallback(async (csv) => {
    const json = await wretchRetry(csvParserEndpoint)
      .addon(QueryStringAddon)
      .query({ csv })
      .get()
      .json();
    return Array.from(json).map(([key, value]) => {
      return {
        key,
        value,
      };
    });
  }, [csvParserEndpoint]);
}

function useGetTargetAudiences() {
  const { accessToken, imsTenant, targetEndpoint } = useApplicationContext();
  return useCallback(async (target) => {
    const url = `${targetEndpoint}?org=${target === 'default' ? imsTenant : target}`;
    const audiences = await wretchRetry(url)
      .auth(`Bearer ${accessToken}`)
      .accept('application/json')
      .get()
      .json();
    return audiences.map((audience) => {
      return {
        key: audience.name.trim(),
        value: audience.description.trim(),
      };
    });
  }, [accessToken, imsTenant, targetEndpoint]);
}

function DataSourceSelector({ label, dataSource, setDataSource }) {
  return (
    <div className={styles.toggleButtons}>
      <LabeledValue label={`${label} Source`} value={''} gridColumnStart={1} gridColumnEnd={3} />
      <ToggleButton
        isSelected={dataSource === DATA_SOURCES.TARGET}
        onChange={() => setDataSource(DATA_SOURCES.TARGET)}>Adobe Target</ToggleButton>
      <ToggleButton
        isSelected={dataSource === DATA_SOURCES.CSV}
        onChange={() => setDataSource(DATA_SOURCES.CSV)}>CSV file</ToggleButton>
    </div>
  );
}

function SelectComponent({
  name, label, params: { description, csv, target }, value, onChange,
}) {
  const getTargetAudiences = useGetTargetAudiences();
  const parseCsv = useParseCsv();
  const [dataSource, setDataSource] = useState();
  const [items, setItems] = React.useState([]);

  useEffect(() => {
    setItems([]);
    if (target && !csv) {
      setDataSource(DATA_SOURCES.TARGET);
    } else if (csv && !target) {
      setDataSource(DATA_SOURCES.CSV);
    }
    if (dataSource === DATA_SOURCES.CSV) {
      parseCsv(csv)
        .then(setItems)
        .catch((err) => {
          console.error(err);
          ToastQueue.negative(`Failed to parse CSV ${csv}`, { timeout: 1000 });
          setItems([]);
        });
    } else if (dataSource === DATA_SOURCES.TARGET) {
      getTargetAudiences(target)
        .then(setItems)
        .catch((err) => {
          console.error(err);
          ToastQueue.negative(`Failed to load from Adobe Target ${target}`, { timeout: 1000 });
          setItems([]);
        });
    }
  }, [target, csv, dataSource, setDataSource, setItems, getTargetAudiences, parseCsv]);

  const getSelectedKey = useCallback((selectedValue) => {
    return String(items.findIndex((item) => item.value === selectedValue));
  }, [items, value]);

  const selectionHandler = useCallback((selected) => {
    onChange(name, items[selected].value);
  }, [name, items, onChange]);

  return (
    <>
      { (target && csv) && <DataSourceSelector label={label} dataSource={dataSource} setDataSource={setDataSource} /> }
      <Picker
        key={name}
        label={label}
        contextualHelp={<DescriptionLabel label={label} description={description} />}
        width="100%"
        placeholder={'Select a value'}
        items={items}
        isDisabled={!items.length}
        selectedKey={getSelectedKey(value)}
        onSelectionChange={selectionHandler}>
        {items ? items.map((item, index) => <Item key={index}>{item.key}</Item>) : []}
      </Picker>
    </>
  );
}

function createSelectComponent(name, label, params, value, onChange) {
  return (
    <SelectComponent
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
    case 'select':
      return createSelectComponent(name, label, params, value, onChange);
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
