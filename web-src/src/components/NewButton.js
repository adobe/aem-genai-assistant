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
import { Button, Text } from '@adobe/react-spectrum';
import { v4 as uuid } from 'uuid';

import { useSetRecoilState } from 'recoil';
import { React, useCallback } from 'react';
import GenAIIcon from '../icons/GenAIIcon.js';
import { currentSessionState } from '../state/CurrentSessionState.js';
import { ViewType, viewTypeState } from '../state/ViewType.js';
import {formatTimestamp} from '../helpers/FormatHelper.js';

export function NewButton(props) {
  const setCurrentSession = useSetRecoilState(currentSessionState);
  const setViewType = useSetRecoilState(viewTypeState);

  const handleNewPrompt = useCallback(() => {
    const timestamp = Date.now();

    const timestampStr = formatTimestamp(timestamp);

    const session = {
      id: uuid(),
      name: `Session ${timestampStr}`,
      description: `Session ${timestampStr}`,
      timestamp,
      prompt: '',
      results: [],
    };
    setCurrentSession(session);
    setViewType(ViewType.CurrentSession);
  }, [setCurrentSession]);

  return (
    <Button
      {...props}
      onPress={handleNewPrompt}
      position={'absolute'}
      variant={'secondary'}>
      <GenAIIcon color="#909090" />
      <Text>New Session</Text>
    </Button>
  );
}
