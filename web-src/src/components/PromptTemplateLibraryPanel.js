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
  Grid, Heading, ProgressCircle, Text, Button,
} from '@adobe/react-spectrum';

import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useIntl } from 'react-intl';
import { css } from '@emotion/css';
import { intlMessages } from './App.l10n.js';
import { WelcomeBanner } from './WelcomeBanner.js';
import { PromptTemplatesView } from './PromptTemplatesView.js';

const styles = {
  v2AlertBanner: css`
    display: flex;
    position: relative;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    color: white;
    background-color: #0569E3;
    margin-bottom: 14px;
    padding: 8px 8px 8px 16px;

    @media (max-width: 1200px) {
      flex-direction: column;
      padding: 14px 16px 8px 16px;
      align-items: flex-end;
    }
  `,
  v2AlertBannerCta: css`
    margin-left: 8px;
    cursor: pointer;
  `,
};

export function PromptTemplateLibraryPanel({ props }) {
  const { formatMessage } = useIntl();

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
        <div className={styles.v2AlertBanner}>
          <Text>{formatMessage(intlMessages.app.v2AlertBanner)}</Text>
          <a href='https://experience.adobe.com/solutions/aem-sites-genai-aem-genai-variations-mfe/static-assets/resources/early-access.html' target='_blank' rel='noreferrer'>
            <Button UNSAFE_className={styles.v2AlertBannerCta} variant={'secondary'} staticColor={'white'}>{formatMessage(intlMessages.app.v2AlertBannerCta)}</Button>
          </a>
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
