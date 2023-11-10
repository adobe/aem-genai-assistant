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
import React from 'react';

import {
  Content,
  Dialog,
  DialogContainer,
  Flex,
  ProgressCircle,
  Text,
} from '@adobe/react-spectrum';

import AccessDeniedIcon from '@spectrum-icons/workflow/LockClosed';
import ErrorIcon from '@spectrum-icons/workflow/AlertCircleFilled';

export function BusyDialog({ inProgress, error }) {
  return (
    <DialogContainer onDismiss={() => 0}>
      <Dialog>
        <Content>
          {inProgress ?
            <Flex direction="row" alignItems="center" gap="size-200"><ProgressCircle isIndeterminate /><Text margin="size-100">Authenticating...</Text></Flex> :
            <Flex direction="row" alignItems="center" gap="size-200"><Text margin="size-100">Sign In</Text>
              {error ?
                <><ErrorIcon size="L" /><Text>Error: {error}</Text></> :
                <><AccessDeniedIcon size="L" /><Text>You have no access to the Assistant</Text></>
              }
            </Flex>
          }
        </Content>
      </Dialog>
    </DialogContainer>
  );
}
