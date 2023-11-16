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
  Flex, Grid, Image, Link, Text,
} from '@adobe/react-spectrum';
import React, { useCallback } from 'react';
import { css } from '@emotion/css';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useApplicationContext } from './ApplicationProvider.js';

import LogoIcon from '../assets/logo.svg';
import PromptsIcon from '../assets/prompts.svg';
import FavoritesIcon from '../assets/favorites.svg';
import RecentsIcon from '../assets/recents.svg';
import HelpIcon from '../assets/help.svg';

import { sessionsState } from '../state/SessionsState.js';
import { currentSessionState } from '../state/CurrentSessionState.js';
import { ViewType, viewTypeState } from '../state/ViewType.js';

export function SidePanel(props) {
  const { appVersion } = useApplicationContext();
  const sessions = useRecoilValue(sessionsState);
  const [currentSession, setCurrentSession] = useRecoilState(currentSessionState);
  const [viewType, setViewType] = useRecoilState(viewTypeState);

  const style = {
    help: css`
      /* Heading/Sans/Sans Default XXS */
      font-size: 14px;
      font-style: normal;
      font-weight: 700;
      line-height: 18px; /* 128.571% */
    `,
    copyright: css`
      font-size: 10px;
      font-style: normal;
      font-weight: 400;
      line-height: 18px; /* 180% */
    `,
  };

  const derivedStyle = {
    clickedMenuItem: css`
      ${style.menuItem};
      background-color: #E0F2FF;
    `,
  }

  const handleRecent = useCallback((session) => {
    setCurrentSession(session);
    setViewType(ViewType.CurrentSession);
  }, [setCurrentSession, setViewType]);

  return (
    <Grid {...props}
      UNSAFE_style={{ padding: '10px' }}
      areas={['header', 'menu', 'footer']}
      columns={['auto']}
      rows={['min-content', '1fr', 'min-content']}
      gap={'size-400'}>
      <Flex UNSAFE_style={{padding: '8px'}} direction={'row'} justifyContent={'space-between'} alignItems={'center'} gridArea={'header'}>
        <Flex direction={'row'} gap={'12px'}>
          <Image src={LogoIcon} alt={'logo'}/>
          <Text UNSAFE_className={style.headerText}>AEM GenAI Assistant</Text>
        </Flex>
        <Text UNSAFE_className={style.versionTag} justifySelf={'end'}>v{appVersion}</Text>
      </Flex>

      <Flex direction={'column'} gridArea={'menu'} gap={'size-100'}>
        <ul>
          <li><Link onPress={() => setViewType(ViewType.NewSession)}>Prompts</Link></li>
          <li><Link onPress={() => setViewType(ViewType.Favorites)}>Favorites</Link></li>
          <li>
            <Text>Recent</Text>
            <ul>
              { (sessions && sessions.length > 0) && sessions.map((session) => (
                <li key={session.id}>
                  <Link onPress={() => handleRecent(session)}>{session.name}</Link>
                </li>
              )) }
            </ul>
          </li>
        </ul>
      </Flex>

      <Flex direction={'column'} gridArea={'footer'} gap={10}>
        <Flex direction={'row'} justifyContent={'start'} alignItems={'center'} gap={'size-100'}>
          <Image src={HelpIcon} width={'20px'}/><Link href="https://www.aem.live/developer/configuring-aem-genai-assistant-sidekick-plugin" target="_blank" UNSAFE_className={style.help}>Help & FAQ</Link>
        </Flex>
        <Text UNSAFE_className={style.copyright}>Copyright © 2023 Adobe. All rights reserved</Text>
      </Flex>
    </Grid>
  );
}
