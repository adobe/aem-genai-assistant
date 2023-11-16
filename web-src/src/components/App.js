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
import React from 'react';
import { ToastContainer } from '@react-spectrum/toast';
import {
  Grid,
} from '@adobe/react-spectrum';
import { useRecoilValue } from 'recoil';
import { ConsentDialog } from './ConsentDialog.js';
import { SidePanel } from './SidePanel.js';
import { CurrentSessionPanel } from './CurrentSessionPanel.js';
import { NewSessionPanel } from './NewSessionPanel.js';
import { viewTypeState, ViewType } from '../state/ViewType.js';
import { FavoritesPanel } from './FavoritesPanel.js';

function getView(viewType) {
  switch (viewType) {
    case ViewType.CurrentSession:
      return <CurrentSessionPanel />;
    case ViewType.Favorites:
      return <FavoritesPanel />;
    default:
      return <NewSessionPanel />;
  }
}

export function App() {
  const viewType = useRecoilValue(viewTypeState);
  return (
    <>
      <ToastContainer />
      <ConsentDialog />
      <Grid
        columns={['300px', '1fr']}
        rows={['100%']}
        gap={'size-300'}
        UNSAFE_style={{ padding: '25px 25px 0 25px' }}
        width="100%" height="100%">
        <SidePanel width="100%" height="100%" />
        { getView(viewType) }
      </Grid>
    </>
  );
}
