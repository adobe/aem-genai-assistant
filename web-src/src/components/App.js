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
import React, { Suspense } from 'react';
import { ToastContainer } from '@react-spectrum/toast';
import {
  Grid, ProgressCircle,
} from '@adobe/react-spectrum';
import { useRecoilValue, useRecoilState } from 'recoil';
import { css } from '@emotion/css';
import { useIntl } from 'react-intl';

import { intlMessages } from './App.l10n.js';
import { ConsentDialog } from './ConsentDialog.js';
import { MainSidePanel } from './MainSidePanel.js';
import { PromptSessionPanel } from './PromptSessionPanel.js';
import { PromptTemplateLibraryPanel } from './PromptTemplateLibraryPanel.js';
import { viewTypeState, ViewType } from '../state/ViewType.js';
import { mainSidePanelTypeState, MainSidePanelType } from '../state/MainSidePanelTypeState.js';
import { FavoriteVariantListPanel } from './FavoriteVariantListPanel.js';

const MAIN_SIDE_PANEL_EXPAND_WIDTH = '330px';
const MAIN_SIDE_PANEL_COLLAPSE_WIDTH = '40px';
const MAIN_SIDE_PANEL_COLLAPSE_WIDTH_THRESHOLD = 1600;

const styles = {
  container: css`
    background: white;
    margin: 0 20px 0 14px;
    border-radius: 20px 20px 0 0;
    height: 100%;
    box-shadow: 0px 0px 3px 0px rgba(0, 0, 0, 0.12), 0px 3px 8px 0px rgba(0, 0, 0, 0.04), 0px 4px 16px 0px rgba(0, 0, 0, 0.08);;
  `,
  noAccessContainer: css`
    display: block;
    border: 1px solid #ccc;
    border-radius: 5px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 25px;
    text-align: center;
    font-size: 16px;
  `,
};

function getView(viewType) {
  switch (viewType) {
    case ViewType.CurrentSession:
      return <PromptSessionPanel />;
    case ViewType.Favorites:
      return <FavoriteVariantListPanel />;
    default:
      return <PromptTemplateLibraryPanel />;
  }
}

function NoAccessMessage() {
  const { formatMessage } = useIntl();

  return (
    <div className={styles.noAccessContainer}>
      {formatMessage(intlMessages.app.noAccessMessage, {
        strong: (msg) => <strong>{msg}</strong>,
        newLine: <br />,
      })}
    </div>
  );
}

export function App() {
  const [hasConsent, setConsent] = React.useState(true);
  const [mainSidePanelWidth, setMainSidePanelWidth] = React.useState();

  const viewType = useRecoilValue(viewTypeState);
  const [mainSidePanel, setMainSidePanelState] = useRecoilState(mainSidePanelTypeState);

  React.useEffect(() => {
    const handleResize = () => {
      setMainSidePanelState(window.innerWidth <= MAIN_SIDE_PANEL_COLLAPSE_WIDTH_THRESHOLD
        ? MainSidePanelType.Collapsed
        : MainSidePanelType.Expanded);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  React.useEffect(() => {
    setMainSidePanelWidth(mainSidePanel === MainSidePanelType.Expanded
      ? MAIN_SIDE_PANEL_EXPAND_WIDTH
      : MAIN_SIDE_PANEL_COLLAPSE_WIDTH);
  }, [mainSidePanel, setMainSidePanelState]);

  return (
    <>
      <ToastContainer />
      <ConsentDialog onConsentChange={setConsent} />
      {hasConsent
        ? <Grid
          columns={[mainSidePanelWidth, '1fr']}
          rows={['100%']}
          gap={'size-200'}
          UNSAFE_style={{ padding: '25px 10px 0' }}
          width="100%" height="100%">
          <MainSidePanel width="100%" height="100%" />
          <div className={styles.container}>
            <Suspense fallback={<ProgressCircle />}>
              {getView(viewType)}
            </Suspense>
          </div>
        </Grid>
        : <NoAccessMessage />}
    </>
  );
}
