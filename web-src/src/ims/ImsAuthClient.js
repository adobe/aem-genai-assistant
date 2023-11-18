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
import { AdobeIMS } from '@identity/imslib';

import { ImsData } from './ImsData.js';
import { ImsActions } from './ImsActions.js';

export class ImsAuthClient {
  adobeIMS = null;

  imsActions = null;

  state = null;

  constructor() {
    const imsData = new ImsData(this.onStateChanged);

    this.adobeIMS = new AdobeIMS(imsData.adobeIdData);
    this.imsActions = new ImsActions(this.adobeIMS, imsData);

    this.state = {
      initialized: true,
      imslibData: imsData.imslibData,
    };

    this.adobeIMS.initialize();
  }

  onStateChanged = (newState) => {
    this.state = {
      ...this.state,
      imslibData: newState,
    };
  };
}
