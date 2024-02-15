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
import { sampleRUM } from '../rum.js';

export function tracking(checkpoint, data = {}) {
  const checkpoints = checkpoint.split(':');
  if (checkpoints.length !== 3) {
    // eslint-disable-next-line no-console
    console.error('tracking: invalid checkpoint length < 3', checkpoints);
    return;
  }
  if (!data.source) {
    // eslint-disable-next-line no-console
    console.error('tracking: Missing source in data object', data);
    return;
  }

  sampleRUM(checkpoint, data);

  // eslint-disable-next-line no-underscore-dangle
  const { _satellite } = window;
  if (!_satellite) return;
  _satellite.track('event', {
    element: data.source,
    feature: 'generatevariations',
    widget: { name: checkpoints[1] },
    attributes: { checkpoint: `aem:${checkpoint}` },
  });
}
