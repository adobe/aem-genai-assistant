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
  Flex, Grid, Image, Link, Text, ActionButton,
} from '@adobe/react-spectrum';
import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { css } from '@emotion/css';
import { useIntl } from 'react-intl';

import { intlMessages } from './PromptSessionSideView.l10n.js';
import { PromptInputView } from './PromptInputView.js';
import { GenerateButton } from './GenerateButton.js';

import GenAIIcon from '../icons/GenAIIcon.js';
import PromptIcon from '../icons/PromptIcon.js';
import ChevronLeft from '../assets/chevron-left.svg';
import { SavePromptButton } from './SavePromptButton.js';
import { ResetButton } from './ResetButton.js';
import { sessionState } from '../state/SessionState.js';
import { ViewType, viewTypeState } from '../state/ViewType.js';

const styles = {
  promptPropertiesPanel: css`
    padding: 20px 0;
    border-right: 2px solid rgb(224, 224, 224); 
  `,
  breadcrumbsLink: css`
    display: flex;
    color: var(--alias-content-neutral-subdued-default, var(--alias-content-neutral-subdued-default, #464646));
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
  `,
  promptName: css`
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
  `,
  actions: css`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    gap: var(--spectrum-global-dimension-size-100);
    border-top: 1px solid rgb(224, 224, 224);
    padding: 20px 10px 0;
    grid-area: buttons;
  `,
  promptFlexItems: css`
    padding: 15px 20px;
  `,
};

export function PromptSessionSideView({
  isOpenPromptEditor, onTogglePrompt, promptEditorError, ...props
}) {
  const currentSession = useRecoilValue(sessionState);
  const [viewType, setViewType] = useRecoilState(viewTypeState);
  const { formatMessage } = useIntl();

  console.log('PromptSessionSideView.js: promptEditorError:', promptEditorError);

  return (
    <Grid
      {...props}
      UNSAFE_className={styles.promptPropertiesPanel}
      areas={['breadcrumbs', 'info', 'form', 'buttons']}
      columns={['auto']}
      rows={['min-content', 'min-content', '1fr', 'min-content']}
      gap={'size-100'}>

      <Flex UNSAFE_className={styles.promptFlexItems} UNSAFE_style={{ paddingTop: '0', paddingBottom: '0' }} direction={'row'} justifyContent={'left'} alignItems={'center'} gridArea={'breadcrumbs'}>
      <Link href="#" onPress={() => setViewType(ViewType.NewSession)} UNSAFE_className={styles.breadcrumbsLink}>
        <Image src={ChevronLeft} alt={'Back'} width={'24px'} />
        {formatMessage(intlMessages.promptSessionSideView.navigationLabel)}
      </Link>
      </Flex>

      {currentSession
        ? <Flex UNSAFE_className={styles.promptFlexItems} UNSAFE_style={{ borderBottom: '1px solid rgb(224, 224, 224)' }} direction={'column'} justifyContent={'stretch'} alignItems={'stretch'} gridArea={'info'}>
          <Flex UNSAFE_style={{ borderRadius: '8px', background: '#E0F2FF', padding: '10px' }} gap={'size-100'} alignItems={'center'}>
            <GenAIIcon />
            <Text UNSAFE_className={styles.promptName}>{currentSession.name ?? 'Empty'}</Text>
          </Flex>
          <Text UNSAFE_style={{ padding: '10px' }}>{currentSession.description ?? 'Empty'}</Text>
        </Flex>
        : <div></div>
      }

      <Flex direction={'column'} UNSAFE_className={styles.promptFlexItems}>
        <Flex direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
          <h3>{formatMessage(intlMessages.promptSessionSideView.inputsLabel)}</h3>
          <ActionButton
            isQuiet
            UNSAFE_className="hover-cursor-pointer"
            onPress={onTogglePrompt}
            UNSAFE_style={isOpenPromptEditor ? { background: 'var(--spectrum-gray-200)' } : undefined}
          >
            <PromptIcon />
            <Text>{formatMessage(intlMessages.promptSessionSideView.editPromptButtonLabel)}</Text>
          </ActionButton>
        </Flex>
        <Flex direction={'column'} UNSAFE_style={{ position: 'relative', height: '100%' }}>
          <PromptInputView />
        </Flex>
      </Flex>

      <div className={styles.actions}>
        <Flex direction={'column'} alignItems={'flex-start'} justifyContent={'center'} flexShrink={0} gap={'4px'}>
          <SavePromptButton isDisabled={promptEditorError} />
          <ResetButton />
        </Flex>
        <GenerateButton isDisabled={promptEditorError} />
      </div>
    </Grid>
  );
}
