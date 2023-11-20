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
import { USER_GUIDELINES_URL } from './LegalTermsLink.js';

import LogoIcon from '../assets/logo.svg';
import PromptsIcon from '../assets/prompts.svg';
import FavoritesIcon from '../assets/favorites.svg';
import RecentsIcon from '../assets/recents.svg';
import HelpIcon from '../assets/help.svg';
import FileTxt from '../assets/file-txt.svg';

import { sessionsState } from '../state/SessionsState.js';
import { currentSessionState } from '../state/CurrentSessionState.js';
import { ViewType, viewTypeState } from '../state/ViewType.js';

export function SidePanel(props) {
  const { appVersion } = useApplicationContext();
  const sessions = useRecoilValue(sessionsState);
  const [currentSession, setCurrentSession] = useRecoilState(currentSessionState);
  const [viewType, setViewType] = useRecoilState(viewTypeState);

  const style = {
    headerText: css`
      font-size: 18px;
      font-style: normal;
      font-weight: 700;
    `,
    versionTag: css`
      background-color: #E9E9E9;
      padding: 0px 9px;
      border-radius: 7px;
    `,
    menu: css`
      font-size: 14px;
      font-style: normal;
      font-weight: 700;
      list-style: none;
      padding: 0;
    `,
    menuItem: css`
      display: flex;
      padding: 10px 10px;
      gap: 12px;
      border-radius: 8px;
    `,
    subMenuItem: css`
      display: flex;
      padding: 10px 10px 10px 50px;
      gap: 12px;
      border-radius: 8px;
      font-weight: normal;
    `,
    menuItemLink: css`
      color: #222;
      &:hover {
        text-decoration: none;
      }
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
    clickedSubMenuItem: css`
      ${style.subMenuItem};
      background-color: #E0F2FF;
    `,
  };

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
      <Flex gap={'12px'} direction={'row'} justifyContent={'space-between'} alignItems={'center'} gridArea={'header'}>
        <Image UNSAFE_className={style.headerLogo} src={LogoIcon} alt={'logo'}/>
        <Text UNSAFE_className={style.headerText}>Generate Content Variations</Text>
        <Text UNSAFE_className={style.versionTag} justifySelf={'end'}>v{appVersion}</Text>
      </Flex>

      <Flex direction={'column'} gridArea={'menu'} gap={'size-100'}>
        <ul className={style.menu}>
          <li className={viewType === ViewType.NewSession ? derivedStyle.clickedMenuItem : style.menuItem}><Image src={PromptsIcon} width={'20px'}/><Link href="#" UNSAFE_className={style.menuItemLink} onPress={() => setViewType(ViewType.NewSession)}>Prompts</Link></li>
          <li className={viewType === ViewType.Favorites ? derivedStyle.clickedMenuItem : style.menuItem}><Image src={FavoritesIcon} width={'20px'}/><Link href="#" UNSAFE_className={style.menuItemLink} onPress={() => setViewType(ViewType.Favorites)}>Favorites</Link></li>
          <li className={style.menuItem}>
            <Image src={RecentsIcon} width={'20px'}/>
            <Text>Recent</Text>
          </li>
          { (sessions && sessions.length > 0) && sessions.map((session) => (
            // eslint-disable-next-line max-len
            <li className={currentSession && viewType === ViewType.CurrentSession && session && session.id === currentSession.id ? derivedStyle.clickedSubMenuItem : style.subMenuItem} key={session.id}>
              <Link href="#" UNSAFE_className={style.menuItemLink} onPress={() => handleRecent(session)}>{session.name}</Link>
            </li>
          )) }
        </ul>
      </Flex>

      <Flex direction={'column'} gridArea={'footer'} gap={'16px'}>
        <Flex direction={'row'} justifyContent={'start'} alignItems={'center'} gap={'12px'}>
          <Image src={HelpIcon} width={'20px'}/><Link href="https://www.aem.live/developer/configuring-aem-genai-assistant-sidekick-plugin" target="_blank" UNSAFE_className={style.menu}>Help & FAQ</Link>
        </Flex>
        <Flex direction={'row'} justifyContent={'start'} alignItems={'center'} gap={'12px'}>
          <Image src={FileTxt} width={'20px'}/><Link href={USER_GUIDELINES_URL} target="_blank" UNSAFE_className={style.menu}>User Guidelines</Link>
        </Flex>
        <Text UNSAFE_className={style.copyright}>Copyright © 2023 Adobe. All rights reserved</Text>
      </Flex>
    </Grid>
  );
}
