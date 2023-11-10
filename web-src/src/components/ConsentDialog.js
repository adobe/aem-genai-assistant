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
import Cookies from 'js-cookie';
import React, { useEffect } from 'react';
import { UserGuidelinesLink } from './UserGuidelinesLink.js';

const CONSENT_COOKIE_NAME = 'genai-assistant-consent';
const CONSENT_COOKIE_EXPIRATION_DAYS = 365 * 10;
const CONSENT_COOKIE_VALUE = 'yes';
const REDIRECT_URL = 'https://adobe.com';

export function ConsentDialog() {
  const [isOpen, setOpen] = React.useState(true);

  useEffect(() => {
    const consent = Cookies.get(CONSENT_COOKIE_NAME);
    setOpen(!consent);
  }, []);

  const handleAgree = () => {
    Cookies.set(CONSENT_COOKIE_NAME, CONSENT_COOKIE_VALUE, { expires: CONSENT_COOKIE_EXPIRATION_DAYS });
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
    window.location.href = REDIRECT_URL;
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
              By clicking &quot;Agree&quot;, you agree to our <UserGuidelinesLink />.
            </p>
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
