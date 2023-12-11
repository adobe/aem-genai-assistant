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
import { sampleRUM } from '../rum.js';

export const CONSENT_KEY = 'genai-assistant-consent';
const EXC_SHELL_GROUP_ID = 'aem-generate-variations';

export function ConsentDialog({ onConsentChange }) {
  const [isOpen, setOpen] = React.useState(false);

  useEffect(() => {
    settingsApi.get({
      groupId: EXC_SHELL_GROUP_ID,
      level: SettingsLevel.USERORG,
      settings: { [CONSENT_KEY]: false },
    }).then(({ settings }) => {
      setOpen(!settings[CONSENT_KEY]);
    });
  }, [setOpen]);

  const handleAgree = () => {
    sampleRUM('genai:consent:agree', { source: 'ConsentDialog#handleAgree' });
    settingsApi.set({
      groupId: EXC_SHELL_GROUP_ID,
      level: SettingsLevel.USERORG,
      settings: { [CONSENT_KEY]: true },
    }).then(() => {
      setOpen(false);
      onConsentChange(true);
    });
  };

  const handleCancel = () => {
    sampleRUM('genai:consent:cancel', { source: 'ConsentDialog#handleCancel' });
    setOpen(false);
    onConsentChange(false);
  };

  return (
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
              By clicking &quot;Agree&quot;, you agree to <LegalTermsLink />, and the following:
            </p>
            <ul>
              <li>
                Any prompts, context, or supplemental information, or other input you provide to this feature (a) must
                be tied to specific context, which can include your branding materials, website content, data, schemas
                for such data, templates, or other trusted documents, and (b) must not contain any personal information
                (personal information includes anything that can be linked back to a specific individual).
              </li>
              <li>
                You should review any output from this feature for accuracy and ensure that it is appropriate for your
                use case.
              </li>
            </ul>
          </Content>
          <ButtonGroup>
            <Button variant="secondary" onPress={handleCancel}>Cancel</Button>
            <Button variant="accent" onPress={handleAgree}>Agree</Button>
          </ButtonGroup>
        </Dialog>
      }
    </DialogContainer>
  );
}
