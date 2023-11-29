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
import { useRecoilValue } from 'recoil';
import { css } from '@emotion/css';
import { ConsentDialog } from './ConsentDialog.js';
import { MainSidePanel } from './MainSidePanel.js';
import { PromptSessionPanel } from './PromptSessionPanel.js';
import { PromptTemplateLibraryPanel } from './PromptTemplateLibraryPanel.js';
import { viewTypeState, ViewType } from '../state/ViewType.js';
import { FavoriteVariantListPanel } from './FavoriteVariantListPanel.js';

const styles = {
  container: css`
    background: white;
    margin: 0 20px 0 20px;
    border-radius: 20px 20px 0 0;
    border: 2px #e0e0e0 solid;
    height: 100%;
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
  return (
    <div className={styles.noAccessContainer}>
      To use Generate Variations you must agree to the Generative AI User Guidelines.<br />
      Refresh this page to <strong>Agree</strong>.
    </div>
  );
}

export function App() {
  const [hasConsent, setConsent] = React.useState(true);

  const viewType = useRecoilValue(viewTypeState);
  return (
    <>
      <ToastContainer />
      <ConsentDialog onConsentChange={setConsent} />
      {hasConsent
        ? <Grid
          columns={['330px', '1fr']}
          rows={['100%']}
          gap={'size-200'}
          UNSAFE_style={{ padding: '25px 25px 0 25px' }}
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
