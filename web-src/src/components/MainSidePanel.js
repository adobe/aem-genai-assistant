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
  Flex, Grid, Image, Link, Text, ActionButton, TooltipTrigger, Tooltip,
} from '@adobe/react-spectrum';
import React, { useCallback } from 'react';
import ShowMenu from '@spectrum-icons/workflow/ShowMenu';
import { css } from '@emotion/css';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useIntl } from 'react-intl';

import { intlMessages as appIntlMessages } from './App.l10n.js';
import { intlMessages } from './MainSidePanel.l10n.js';
import { useApplicationContext } from './ApplicationProvider.js';
import { USER_GUIDELINES_URL } from './LegalTermsLink.js';

import PromptsIcon from '../assets/prompts.svg';
import FavoritesIcon from '../assets/favorites.svg';
import RecentsIcon from '../assets/recents.svg';
import HelpIcon from '../assets/help.svg';
import FileTxt from '../assets/file-txt.svg';

import { sessionHistoryState } from '../state/SessionHistoryState.js';
import { sessionState } from '../state/SessionState.js';
import { ViewType, viewTypeState } from '../state/ViewType.js';
import { MainSidePanelType, mainSidePanelState } from '../state/MainSidePanelState.js';
import { ClickableImage } from './ClickableImage.js';

export const HELP_AND_FAQ_URL = 'https://www.aem.live/docs/sidekick-generate-variations';

export function MainSidePanel(props) {
  const { appVersion } = useApplicationContext();
  const sessions = useRecoilValue(sessionHistoryState);

  const [currentSession, setCurrentSession] = useRecoilState(sessionState);
  const [viewType, setViewType] = useRecoilState(viewTypeState);
  const [mainSidePanel, setMainSidePanelState] = useRecoilState(mainSidePanelState);

  const { formatMessage } = useIntl();

  const style = {
    headerText: css`
      font-size: 18px;
      font-style: normal;
      font-weight: 700;
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
      padding-left: 10px;
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

  const toggleMainSidePanelState = useCallback(() => {
    if (mainSidePanel === MainSidePanelType.Expanded) {
      setMainSidePanelState(MainSidePanelType.Collapsed);
    } else {
      setMainSidePanelState(MainSidePanelType.Expanded);
    }
  }, [mainSidePanel]);

  return (
    <Grid {...props}
      UNSAFE_style={{ padding: '10px' }}
      areas={['header', 'menu', 'footer']}
      columns={['auto']}
      rows={['min-content', '1fr', 'min-content']}
      gap={'size-400'}>
      <Flex gap={'12px'} direction={'row'} justifyContent={'space-between'} alignItems={'center'} gridArea={'header'}>
        <Flex UNSAFE_style={{ paddingLeft: '4px' }} gap={'6px'} direction={'row'} alignItems={'center'}>
          <TooltipTrigger delay={0}>
            <ActionButton
              isQuiet
              UNSAFE_className="hover-cursor-pointer"
              onPress={toggleMainSidePanelState}>
              <ShowMenu size='S' />
            </ActionButton>
            <Tooltip>
              {mainSidePanel === MainSidePanelType.Collapsed
                ? <Text>{formatMessage(intlMessages.mainSidePanel.expandMenuType)}</Text>
                : <Text>{formatMessage(intlMessages.mainSidePanel.collapseMenuType)}</Text>}
            </Tooltip>
          </TooltipTrigger>
          {mainSidePanel === MainSidePanelType.Expanded
            && <Text UNSAFE_className={style.headerText}>{formatMessage(intlMessages.mainSidePanel.title)}</Text>}
        </Flex>
        {mainSidePanel === MainSidePanelType.Expanded
          && <Text UNSAFE_className={style.versionTag}>v{appVersion}</Text>}
      </Flex>

      <Flex direction={'column'} gridArea={'menu'} gap={'size-100'}>
        <ul className={style.menu}>
          <li className={viewType === ViewType.NewSession ? derivedStyle.clickedMenuItem : style.menuItem}>
            <ClickableImage src={PromptsIcon} width={'20px'} title={formatMessage(intlMessages.mainSidePanel.promptTemplatesMenuItem)} alt={'New prompt template'} onClick={() => setViewType(ViewType.NewSession)} />
            {mainSidePanel === MainSidePanelType.Expanded
              && <Link href="#" UNSAFE_className={style.menuItemLink} onPress={() => setViewType(ViewType.NewSession)}>{formatMessage(intlMessages.mainSidePanel.promptTemplatesMenuItem)}</Link>}
          </li>
          <li className={viewType === ViewType.Favorites ? derivedStyle.clickedMenuItem : style.menuItem}>
            <ClickableImage src={FavoritesIcon} width={'20px'} title={formatMessage(intlMessages.mainSidePanel.favoritesMenuItem)} alt={'Favorites'} onClick={() => setViewType(ViewType.Favorites)} />
            {mainSidePanel === MainSidePanelType.Expanded
              && <Link href="#" UNSAFE_className={style.menuItemLink} onPress={() => setViewType(ViewType.Favorites)}>{formatMessage(intlMessages.mainSidePanel.favoritesMenuItem)}</Link>}
          </li>
          <li className={style.menuItem}>
            {mainSidePanel === MainSidePanelType.Expanded
              ? <Image src={RecentsIcon} width={'20px'} alt={'Recents'} />
              : <ClickableImage src={RecentsIcon} width={'20px'} title={formatMessage(intlMessages.mainSidePanel.recentsMenuItem)} alt={'Recents'} onClick={() => (sessions?.length > 0) && setMainSidePanelState(MainSidePanelType.Expanded)} />
            }
            {mainSidePanel === MainSidePanelType.Expanded
              && <Text>{formatMessage(intlMessages.mainSidePanel.recentsMenuItem)}</Text>}
          </li>
          {(mainSidePanel === MainSidePanelType.Expanded && sessions && sessions.length > 0)
            && sessions.map((session) => (
              // eslint-disable-next-line max-len
              <li className={currentSession && viewType === ViewType.CurrentSession && session && session.id === currentSession.id ? derivedStyle.clickedSubMenuItem : style.subMenuItem} key={session.id}>
                <Link href="#" UNSAFE_className={style.menuItemLink} onPress={() => handleRecent(session)}>{session.name}</Link>
              </li>
            ))}
        </ul>
      </Flex>

      <Flex direction={'column'} gridArea={'footer'} gap={'16px'}>
        <ul className={style.menu}>
          <li className={style.menuItem}>
            <ClickableImage src={HelpIcon} width={'20px'} title={formatMessage(intlMessages.mainSidePanel.helpAndFaqsMenuItem)} alt={'Help'} onClick={() => window.open(HELP_AND_FAQ_URL, '_blank')} />
            {mainSidePanel === MainSidePanelType.Expanded && <Link href={HELP_AND_FAQ_URL} target="_blank" UNSAFE_className={style.menu}>{formatMessage(intlMessages.mainSidePanel.helpAndFaqsMenuItem)}</Link>}
          </li>
          <li className={style.menuItem}>
            <ClickableImage src={FileTxt} width={'20px'} title={formatMessage(intlMessages.mainSidePanel.userGuidelinesMenuItem)} alt={'Guidelines'} onClick={() => window.open(USER_GUIDELINES_URL, '_blank')} />
            {mainSidePanel === MainSidePanelType.Expanded && <Link href={USER_GUIDELINES_URL} target="_blank" UNSAFE_className={style.menu}>{formatMessage(intlMessages.mainSidePanel.userGuidelinesMenuItem)}</Link>}
          </li>
        </ul>
        {mainSidePanel === MainSidePanelType.Expanded
          ? <>
            <Text UNSAFE_className={style.copyright}>
              {formatMessage(intlMessages.mainSidePanel.copyrightLabel)}
              <br/>
              {`${formatMessage(appIntlMessages.app.name)}, v${appVersion}`}
            </Text>
          </>
          : <Text />}
      </Flex>
    </Grid>
  );
}
