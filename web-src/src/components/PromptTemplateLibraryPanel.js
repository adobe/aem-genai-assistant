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
  Grid, Heading, ProgressCircle, Text,
  Link,
  Button,
} from '@adobe/react-spectrum';

import React, { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useIntl } from 'react-intl';
import { css } from '@emotion/css';
import Close from '@spectrum-icons/workflow/Close';
import { intlMessages } from './App.l10n.js';
import { WelcomeBanner } from './WelcomeBanner.js';
import { PromptTemplatesView } from './PromptTemplatesView.js';

const styles = {
  newVersionAlert: css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    position: relative;
    color: white;
    background-color: #0569E3;
    margin-bottom: 14px;
    padding: 8px 64px 8px 16px;
    border-radius: 4px;
    min-height: 48px;

    &.hidden {
      display: none;
    }
  `,
  newVersionAlertCta: css`
    text-decoration: underline;
  `,
  newVersionAlertCloseContainer: css`
    display: flex;
    align-items: center;
    border-inline-start-color: #fff3;
    border-inline-start-style: solid;
    border-inline-start-width: 1px;
    padding-inline-start: 8px;
    margin-inline-start: 8px;
    position: absolute;
    right: 8px;
    min-height: 32px;
    height: 80%;

    @media (max-width: 1190px) {
      align-items: flex-start;
    }
  `,
  newVersionAlertClose: css`
    margin: 2px;
    border: none;
    border-radius: 100%;

    & svg {
      width: 12px;
      height: 12px;
      padding: 4px 5px;
    }

    &:hover {
      cursor: pointer;
    }
  `,
};

export function PromptTemplateLibraryPanel({ props }) {
  const { formatMessage } = useIntl();
  const [isNewVersionAlertOpen, setIsNewVersionAlertOpen] = useState(true);

  return (
    <Grid
      {...props}
      columns={['1fr']}
      rows={['min-content', 'min-content', '1fr']}
      height={'100%'}
      UNSAFE_style={{
        padding: '25px 50px', overflow: 'auto',
      }}>

      <div tabIndex={0}>
        <div className={`${styles.newVersionAlert} ${isNewVersionAlertOpen ? '' : 'hidden'}`}>
          <Text>{formatMessage(intlMessages.app.newVersionAlert, {
            landingPageLink: <Link variant='overBackground' UNSAFE_className={styles.newVersionAlertCta} href='https://experience.adobe.com/solutions/aem-sites-genai-aem-genai-variations-mfe/static-assets/resources/ga.html' target='_blank' rel='noreferrer'>{formatMessage(intlMessages.app.newVersionAlertCta)}</Link>,
          })}</Text>
          <div className={styles.newVersionAlertCloseContainer}>
            <Button variant='secondary' staticColor='white' UNSAFE_className={styles.newVersionAlertClose} onPress={() => { setIsNewVersionAlertOpen(false); }}>
              <Close />
            </Button>
          </div>
        </div>
        <WelcomeBanner />

        <Heading level={3} alignSelf={'start'}>{formatMessage(intlMessages.app.promptTemplatesLibraryPanelLabel)}</Heading>

        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Suspense fallback={<ProgressCircle isIndeterminate />}>
            <PromptTemplatesView />
          </Suspense>
        </ErrorBoundary>
      </div>
    </Grid>
  );
}
