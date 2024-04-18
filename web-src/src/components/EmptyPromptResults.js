/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import { View, Flex, Text } from '@adobe/react-spectrum';
import React from 'react';
import { css } from '@emotion/css';
import { useIntl } from 'react-intl';

import { intlMessages } from './PromptResultCard.l10n.js';
import FavoritesIcon from '../icons/FavoritesIcon.js';
import PromptIcon from '../icons/PromptIcon.js';
import EditIcon from '../icons/EditIcon.js';
import GenAIIcon from '../icons/GenAIIcon.js';

const style = {
  icon: css`
    display: flex;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background-color: #E6E6E6;
    align-items: center;
    justify-content: center;
  `,
};

export default function EmptyPromptResults({ className, width, isNew }) {
  const { formatMessage } = useIntl();

  return (
    <View UNSAFE_className={className} width={width}>
      <Flex direction="column" width="100%" gap="24px">
        {isNew ? (
          <>
            <Flex direction="row" gap="24px">
              <View UNSAFE_className={style.icon}>
                <PromptIcon width="20px" height="20px" />
              </View>
              <Flex direction="column" gap="8px">
                <Text><strong>{formatMessage(intlMessages.promptResultCard.createPromptTitle)}</strong></Text>
                <Text>{formatMessage(intlMessages.promptResultCard.createPromptDescription)}</Text>
              </Flex>
            </Flex>
            <Flex direction="row" gap="24px">
              <View UNSAFE_className={style.icon}>
                <GenAIIcon width="20px" height="20px" />
              </View>
              <Flex direction="column" gap="8px">
                <Text><strong>{formatMessage(intlMessages.promptResultCard.generateContentTitle)}</strong></Text>
                <Text>{formatMessage(intlMessages.promptResultCard.generateContentDescription)}</Text>
              </Flex>
            </Flex>
          </>
        ) : (
          <Flex direction="row" gap="24px">
            <View UNSAFE_className={style.icon}>
              <GenAIIcon width="20px" height="20px" />
            </View>
            <Flex direction="column" gap="8px">
              <Text><strong>{formatMessage(intlMessages.promptResultCard.fillFormGenerateContentTitle)}</strong></Text>
              <Text>{formatMessage(intlMessages.promptResultCard.fillFormGenerateContentDescription)}</Text>
            </Flex>
          </Flex>
        )}
        <Flex direction="row" gap="24px">
          <View UNSAFE_className={style.icon}>
            <EditIcon width="20px" height="20px" />
          </View>
          <Flex direction="column" gap="8px">
            <Text><strong>{formatMessage(intlMessages.promptResultCard.refineContentTitle)}</strong></Text>
            <Text>{formatMessage(intlMessages.promptResultCard.refineContentDescription)}</Text>
          </Flex>
        </Flex>
        <Flex direction="row" gap="24px">
          <View UNSAFE_className={style.icon}>
            <FavoritesIcon width="20px" height="20px" />
          </View>
          <Flex direction="column" gap="8px">
            <Text><strong>{formatMessage(intlMessages.promptResultCard.savePromptTitle)}</strong></Text>
            <Text>{formatMessage(intlMessages.promptResultCard.savePromptDescription)}</Text>
          </Flex>
        </Flex>
      </Flex>
    </View>
  );
}
