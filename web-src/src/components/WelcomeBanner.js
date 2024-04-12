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
  Flex, Heading, Text, Image,
} from '@adobe/react-spectrum';
import React from 'react';
import { css } from '@emotion/css';
import { useIntl } from 'react-intl';
import NewSessionBanner from '../assets/new-session-banner.png';
import { intlMessages } from './App.l10n.js';

const styles = {
  banner: css`
    border-radius: 16px;
    height: 240px;
    overflow: hidden; 
    margin-bottom: 30px;
  `,
  container: css`
    flex: 1;
    height: 100%;
    padding: 40px;
    background: var(--palette-gray-100, #F8F8F8);
  `,
  image: css`
    height: 100%;
  `,
};

export function WelcomeBanner({
  template, onClick, ...props
}) {
  const { formatMessage } = useIntl();

  return (
    <Flex direction="row" alignItems="center" justifyContent="space-between" flexWrap="nowrap" {...props} UNSAFE_className={styles.banner}>
      <div className={styles.container}>
        <Text>
          <Heading level={1} alignSelf={'start'}>
            {formatMessage(intlMessages.app.name)}
          </Heading>
          {formatMessage(intlMessages.app.description)}
        </Text>
      </div>
      <Image flex="1" src={NewSessionBanner} UNSAFE_className={styles.image} objectFit="cover" alt={'Generate Variations Poster'} />
    </Flex>
  );
}
