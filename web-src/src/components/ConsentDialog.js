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
  Dialog,
  DialogContainer,
  Image,
  Heading,
} from '@adobe/react-spectrum';
import React, { useEffect } from 'react';
import settingsApi, { SettingsLevel } from '@adobe/exc-app/settings';
import { useIntl } from 'react-intl';

import { intlMessages } from './App.l10n.js';
import { LegalTermsLink } from './LegalTermsLink.js';
import { log, analytics } from '../helpers/MetricsHelper.js';
import ConsentHero from '../assets/consent-hero.png';

export const CONSENT_KEY = 'genai-assistant-consent';
const EXC_SHELL_GROUP_ID = 'aem-generate-variations';

export function ConsentDialog({ onConsentChange }) {
  const [isOpen, setOpen] = React.useState(false);
  const { formatMessage } = useIntl();

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
    log('consent:agree', { source: 'ConsentDialog#handleAgree' });
    analytics({
      widget: {
        name: 'Consent Dialog',
        type: 'NA',
      },
      element: 'Accept Consent',
      elementId: 'consent:agree',
      type: 'button',
      action: 'click',
    });
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
    log('consent:cancel', { source: 'ConsentDialog#handleCancel' });
    analytics({
      widget: {
        name: 'Consent Dialog',
        type: 'NA',
      },
      element: 'Cancel Consent',
      elementId: 'consent:cancel',
      type: 'button',
      action: 'click',
    });
    setOpen(false);
    onConsentChange(false);
  };

  return (
    <DialogContainer onDismiss={handleCancel}>
      {isOpen
        && <Dialog onDismiss={handleCancel}>
          <Image src={ConsentHero} slot="hero" objectFit="cover" height="200px" alt="Consent Hero" />
          <Heading>{formatMessage(intlMessages.app.consentDialogHeading)}</Heading>
          <Content>
            {formatMessage(intlMessages.app.consentDialogContent, {
              p: (chunks) => <p>{chunks}</p>,
              ul: (chunks) => <ul>{chunks}</ul>,
              li: (chunks) => <li>{chunks}</li>,
              legalTermsLink: <LegalTermsLink />,
            })}
          </Content>
          <ButtonGroup>
            <Button variant="secondary" onPress={handleCancel}>{formatMessage(intlMessages.app.consentDialogCancelButtonLabel)}</Button>
            <Button variant="accent" onPress={handleAgree}>{formatMessage(intlMessages.app.consentDialogAgreeButtonLabel)}</Button>
          </ButtonGroup>
        </Dialog>
      }
    </DialogContainer>
  );
}
