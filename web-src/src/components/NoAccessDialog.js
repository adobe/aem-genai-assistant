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
  Heading,
  IllustratedMessage,
} from '@adobe/react-spectrum';
import { useIntl } from 'react-intl';

import AccessDeniedIcon from '@spectrum-icons/workflow/LockClosed';
import { intlMessages } from './App.l10n.js';

export function NoAccessDialog() {
  const { formatMessage } = useIntl();

  return (
    <DialogContainer onDismiss={() => 0}>
      <Dialog>
        <Content>
          <IllustratedMessage>
            <AccessDeniedIcon size={'XL'} />
            <Heading>{formatMessage(intlMessages.app.noAccessDialogHeading)}</Heading>
            <Content>{formatMessage(intlMessages.app.noAccessDialogContent)}</Content>
          </IllustratedMessage>
        </Content>
      </Dialog>
    </DialogContainer>
  );
}