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
  Button,
  ButtonGroup,
  Content,
  Dialog, DialogContainer,
  Divider,
  Heading,
} from '@adobe/react-spectrum';
import React, { useEffect } from 'react';
import settingsApi, { SettingsLevel } from '@adobe/exc-app/settings';
import { LegalTermsLink } from './LegalTermsLink.js';
import { NoAccessDialog } from './NoAccessDialog.js';
import { tracking } from '../helpers/Tracking.js';

export const CONSENT_KEY = 'genai-assistant-consent';

export function ConsentDialog() {
  const [isOpen, setOpen] = React.useState(false);
  const [isAccess, setAccess] = React.useState(true);

  useEffect(() => {
    settingsApi.get({
      groupId: 'test-aem-genai-assistant',
      level: SettingsLevel.USERORG,
      settings: { [CONSENT_KEY]: false },
    }).then(({ settings }) => {
      setOpen(!settings[CONSENT_KEY]);
    });
  }, [setOpen]);

  const handleAgree = () => {
    tracking('genai:consent:agree', { source: 'ConsentDialog#handleAgree' });
    settingsApi.set({
      groupId: 'test-aem-genai-assistant',
      level: SettingsLevel.USERORG,
      settings: { [CONSENT_KEY]: true },
    }).then(() => {
      setOpen(false);
      setAccess(true);
    });
  };

  const handleCancel = () => {
    tracking('genai:consent:cancel', { source: 'ConsentDialog#handleCancel' });
    setOpen(false);
    setAccess(false);
  };

  return (
    isAccess ? (
      <DialogContainer onDismiss={handleCancel}>
        {isOpen
          && <Dialog onDismiss={handleCancel}>
            <Heading>Generative AI in Adobe apps</Heading>
            <Divider />
            <Content>
              <p>
                You can create in new ways with generative AI technology.
              </p>
              <p>
                By clicking &quot;Agree&quot;, you agree to our <LegalTermsLink />.
              </p>
            </Content>
            <ButtonGroup>
              <Button variant="secondary" onPress={handleCancel}>Cancel</Button>
              <Button variant="accent" onPress={handleAgree}>Agree</Button>
            </ButtonGroup>
          </Dialog>
        }
      </DialogContainer>
    ) : <NoAccessDialog />
  );
}
