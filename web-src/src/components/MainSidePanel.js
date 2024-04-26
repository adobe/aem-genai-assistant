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
  Flex, Grid, Image, Link, Text, ActionButton, TooltipTrigger, Tooltip, Heading,
} from '@adobe/react-spectrum';
import React, { useCallback } from 'react';
import ShowMenu from '@spectrum-icons/workflow/ShowMenu';
import { css } from '@emotion/css';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useIntl } from 'react-intl';

import { intlMessages } from './MainSidePanel.l10n.js';
import { USER_GUIDELINES_URL } from './LegalTermsLink.js';

import PromptsIcon from '../assets/prompts.svg';
import FavoritesIcon from '../assets/favorites.svg';
import RecentsIcon from '../assets/recents.svg';
import HelpIcon from '../assets/help.svg';
import FileTxt from '../assets/file-txt.svg';

import { sessionHistoryState } from '../state/SessionHistoryState.js';
import { sessionState } from '../state/SessionState.js';
import { ViewType, viewTypeState } from '../state/ViewType.js';
import { MainSidePanelType, mainSidePanelTypeState } from '../state/MainSidePanelTypeState.js';
import { ClickableImage } from './ClickableImage.js';
import { APP_VERSION, RUN_MODE_CF, useApplicationContext } from './ApplicationProvider.js';
import { contentFragmentState } from '../state/ContentFragmentState.js';

export const HELP_AND_FAQ_URL = 'https://www.aem.live/docs/sidekick-generate-variations';

const styles = {
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
      padding-left: 10px;
    `,
};

const derivedStyles = {
  clickedMenuItem: css`
      ${styles.menuItem};
      background-color: #E0F2FF;
    `,
  clickedSubMenuItem: css`
      ${styles.subMenuItem};
      background-color: #E0F2FF;
    `,
};

function ContentFragmentRunModeContext() {
  const { aemService } = useApplicationContext();
  const contentFragment = useRecoilValue(contentFragmentState);

  return (
    <Flex direction={'column'}>
      <>
        <Heading level={4} marginBottom={'size-10'}>Connected to AEM Service:</Heading>
        <Text>{aemService.getHost()}</Text>
      </>
      { contentFragment && contentFragment.fragment
        && <>
          <Heading level={4} marginBottom={'size-10'}>Variations will be exported to:</Heading>
          <Text>{contentFragment.fragment.title}</Text>
        </>
      }
    </Flex>
  );
}

export function MainSidePanel(props) {
  const { runMode } = useApplicationContext();

  const sessions = useRecoilValue(sessionHistoryState);
  const [currentSession, setCurrentSession] = useRecoilState(sessionState);
  const [viewType, setViewType] = useRecoilState(viewTypeState);
  const [mainSidePanelType, setMainSidePanelType] = useRecoilState(mainSidePanelTypeState);

  const { formatMessage } = useIntl();

  const handleRecent = useCallback((session) => {
    setCurrentSession(session);
    setViewType(ViewType.CurrentSession);
  }, [setCurrentSession, setViewType]);

  const toggleMainSidePanelState = useCallback(() => {
    if (mainSidePanelType === MainSidePanelType.Expanded) {
      setMainSidePanelType(MainSidePanelType.Collapsed);
    } else {
      setMainSidePanelType(MainSidePanelType.Expanded);
    }
  }, [mainSidePanelType]);

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
              {mainSidePanelType === MainSidePanelType.Collapsed
                ? <Text>{formatMessage(intlMessages.mainSidePanel.expandMenuType)}</Text>
                : <Text>{formatMessage(intlMessages.mainSidePanel.collapseMenuType)}</Text>}
            </Tooltip>
          </TooltipTrigger>
          {mainSidePanelType === MainSidePanelType.Expanded
            && <Text UNSAFE_className={styles.headerText}>{formatMessage(intlMessages.mainSidePanel.title)}</Text>}
        </Flex>
        {mainSidePanelType === MainSidePanelType.Expanded
          && <Text UNSAFE_className={styles.versionTag}>v{APP_VERSION}</Text>}
      </Flex>

      { runMode !== RUN_MODE_CF
        && <Flex direction={'column'} gridArea={'menu'} gap={'size-100'}>
          <ul className={styles.menu}>
            <li className={viewType === ViewType.NewSession ? derivedStyles.clickedMenuItem : styles.menuItem}>
              <ClickableImage src={PromptsIcon} width={'20px'} title={formatMessage(intlMessages.mainSidePanel.promptTemplatesMenuItem)} alt={'New prompt template'} onClick={() => setViewType(ViewType.NewSession)} />
              {mainSidePanelType === MainSidePanelType.Expanded
              && <Link href="#" UNSAFE_className={styles.menuItemLink} onPress={() => setViewType(ViewType.NewSession)}>{formatMessage(intlMessages.mainSidePanel.promptTemplatesMenuItem)}</Link>}
            </li>
            <li className={viewType === ViewType.Favorites ? derivedStyles.clickedMenuItem : styles.menuItem}>
              <ClickableImage src={FavoritesIcon} width={'20px'} title={formatMessage(intlMessages.mainSidePanel.favoritesMenuItem)} alt={'Favorites'} onClick={() => setViewType(ViewType.Favorites)} />
              {mainSidePanelType === MainSidePanelType.Expanded
              && <Link href="#" UNSAFE_className={styles.menuItemLink} onPress={() => setViewType(ViewType.Favorites)}>{formatMessage(intlMessages.mainSidePanel.favoritesMenuItem)}</Link>}
            </li>
            <li className={styles.menuItem}>
              {mainSidePanelType === MainSidePanelType.Expanded
                ? <Image src={RecentsIcon} width={'20px'} alt={'Recents'} />
                : <ClickableImage src={RecentsIcon} width={'20px'} title={formatMessage(intlMessages.mainSidePanel.recentsMenuItem)} alt={'Recents'} onClick={() => (sessions?.length > 0) && setMainSidePanelType(MainSidePanelType.Expanded)} />
              }
              {mainSidePanelType === MainSidePanelType.Expanded
              && <Text>{formatMessage(intlMessages.mainSidePanel.recentsMenuItem)}</Text>}
            </li>
            {(mainSidePanelType === MainSidePanelType.Expanded && sessions && sessions.length > 0)
              && sessions.map((session) => (
                // eslint-disable-next-line max-len
                <li className={currentSession && viewType === ViewType.CurrentSession && session && session.id === currentSession.id ? derivedStyles.clickedSubMenuItem : styles.subMenuItem} key={session.id}>
                  <Link href="#" UNSAFE_className={styles.menuItemLink} onPress={() => handleRecent(session)}>{session.name}</Link>
                </li>
              ))}
          </ul>
        </Flex>
      }

      { (runMode === RUN_MODE_CF && mainSidePanelType === MainSidePanelType.Expanded)
        && <ContentFragmentRunModeContext />
      }

      <Flex direction={'column'} gridArea={'footer'} gap={'16px'}>
      <ul className={styles.menu}>
          <li className={styles.menuItem}>
            <ClickableImage src={HelpIcon} width={'20px'} title={formatMessage(intlMessages.mainSidePanel.helpAndFaqsMenuItem)} alt={'Help'} onClick={() => window.open(HELP_AND_FAQ_URL, '_blank')} />
            {mainSidePanelType === MainSidePanelType.Expanded && <Link href={HELP_AND_FAQ_URL} target="_blank" UNSAFE_className={styles.menu}>{formatMessage(intlMessages.mainSidePanel.helpAndFaqsMenuItem)}</Link>}
          </li>
          <li className={styles.menuItem}>
            <ClickableImage src={FileTxt} width={'20px'} title={formatMessage(intlMessages.mainSidePanel.userGuidelinesMenuItem)} alt={'Guidelines'} onClick={() => window.open(USER_GUIDELINES_URL, '_blank')} />
            {mainSidePanelType === MainSidePanelType.Expanded && <Link href={USER_GUIDELINES_URL} target="_blank" UNSAFE_className={styles.menu}>{formatMessage(intlMessages.mainSidePanel.userGuidelinesMenuItem)}</Link>}
          </li>
          {mainSidePanelType === MainSidePanelType.Expanded
            ? <Text UNSAFE_className={styles.copyright}>
                {formatMessage(intlMessages.mainSidePanel.copyrightLabel)}
              </Text>
            : <Text />}
        </ul>
      </Flex>
    </Grid>
  );
}
