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
import featureFlags from '@adobe/exc-app/featureflags';
import { getFeatureFlags } from './FeatureFlagsHelper.js';

jest.mock('@adobe/exc-app/featureflags', () => {
  return {
    get: jest.fn(),
  };
});

describe('getFeatureFlags', () => {
  it('should fetch and return the feature flags', async () => {
    const mockFlags = {
      'aem-generate-variations': true,
    };
    featureFlags.get.mockResolvedValue(mockFlags);

    const result = await getFeatureFlags();

    expect(featureFlags.get).toHaveBeenCalledWith(['aem-generate-variations']);
    expect(result).toBe(true);
  });
});
