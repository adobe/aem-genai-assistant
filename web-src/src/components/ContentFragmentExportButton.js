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
import { useRecoilValue } from 'recoil';
import React, { useCallback, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { ToastQueue } from '@react-spectrum/toast';
import {
  Button,
  ButtonGroup,
  Content,
  Dialog,
  DialogTrigger,
  Divider,
  Form,
  Heading,
  ProgressCircle,
  Text,
  TextField,
} from '@adobe/react-spectrum';
import CreateVariationIcon from '@spectrum-icons/workflow/BoxExport';
import { log } from '../helpers/MetricsHelper.js';
import { useApplicationContext } from './ApplicationProvider.js';
import { contentFragmentState } from '../state/ContentFragmentState.js';

export function ContentFragmentExportButton({ variant }) {
  const { aemService } = useApplicationContext();
  const contentFragment = useRecoilValue(contentFragmentState);
  const [variationName, setVariationName] = useState(variant.content.variationName ?? `var-${uuid()}`);
  const [exportedVariations, setExportedVariations] = useState([]);
  const [isExportInProgress, setIsExportInProgress] = useState(false);
  const [isExportAndOpenInProgress, setIsExportAndOpenInProgress] = useState(false);

  if (variant.content.variationName !== variationName) {
    setVariationName(variant.content.variationName);
  }

  const handleExportVariation = useCallback((shouldOpenEditor) => {
    if (shouldOpenEditor) {
      setIsExportAndOpenInProgress(true);
    } else {
      setIsExportInProgress(true);
    }
    log('prompt:export', { variant: variant.id, as: 'contentFragmentVariation' });
    return aemService.createFragmentVariation(contentFragment.fragment.id, variationName, variant.content)
      .then((variation) => {
        setExportedVariations((prev) => [...prev, variant.id]);
        if (shouldOpenEditor) {
          const url = `https://experience.adobe.com/?repo=${new URL(aemService.getHost()).host}#/aem/cf/editor/editor${contentFragment.fragment.path}`;
          window.open(url, '_blank');
        }
        ToastQueue.positive('Variation created', { timeout: 1000 });
      })
      .catch((error) => {
        ToastQueue.negative(error.message, { timeout: 1000 });
      })
      .finally(() => {
        setIsExportAndOpenInProgress(false);
        setIsExportInProgress(false);
      });
  }, [variant, variationName, exportedVariations, aemService, contentFragment]);

  return (
    <DialogTrigger type='modal'>
      <Button
        UNSAFE_className="hover-cursor-pointer"
        marginStart={'size-100'}
        marginEnd={'size-100'}
        width="size-2000"
        variant="secondary"
        style="fill"
        isDisabled={exportedVariations.includes(variant.id)}>
        <CreateVariationIcon marginEnd={'8px'}/>
        Export Variation
      </Button>
      {(close) => (
        <Dialog width={'550px'}>
          <Heading>Export Variation</Heading>
          <Divider/>
          <Content>
            <Form onSubmit={(e) => e.preventDefault()}>
              <Text marginBottom={10}>
                Export the selected variation as a new content fragment variation.
              </Text>
              <TextField
                value={variationName}
                onChange={setVariationName}
                label={'Name'}
                width={'100%'}>
              </TextField>
            </Form>
          </Content>
          <ButtonGroup>
            <Button variant={'secondary'} onPress={close}>Cancel</Button>
            <Button width="size-1250" variant={'cta'} isDisabled={isExportInProgress || isExportAndOpenInProgress}
                    onPress={() => handleExportVariation(false).then(close)}>
              {isExportInProgress
                ? <ProgressCircle size="S" aria-label="Export" isIndeterminate right="8px"/>
                : <CreateVariationIcon marginEnd={'8px'}/>
              }
              Export
            </Button>
            <Button width="size-3000" variant={'cta'} isDisabled={isExportInProgress || isExportAndOpenInProgress}
                    onPress={() => handleExportVariation(true).then(close)}>
              {isExportAndOpenInProgress
                ? <ProgressCircle size="S" aria-label="Export" isIndeterminate right="8px"/>
                : <CreateVariationIcon marginEnd={'8px'}/>
              }
              Export and Open in CF Editor
            </Button>
          </ButtonGroup>
        </Dialog>
      )}
    </DialogTrigger>
  );
}
