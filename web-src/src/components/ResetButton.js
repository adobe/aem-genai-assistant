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
  ActionButton, Button, Image, Text,
} from '@adobe/react-spectrum';
import { useSetRecoilState } from 'recoil';
import React from 'react';

import ResetIcon from '../assets/reset.svg';
import { parametersState } from '../state/ParametersState.js';

export function ResetButton(props) {
  const setParameters = useSetRecoilState(parametersState);

  const handleReset = () => {
    setParameters([]);
  };

  return (
    <ActionButton
      {...props}
      isQuiet
      onPress={handleReset}
      variant={''}>
      <Image src={ResetIcon}/>
      <Text>Reset</Text>
    </ActionButton>
  );
}
