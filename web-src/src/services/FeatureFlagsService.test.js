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
import { FeatureFlagsService } from './FeatureFlagsService.js';

const PROJECT_ID = 'project-id';
const FLAG_NAME = 'flag-name';

jest.mock('@adobe/exc-app/featureflags', () => {
  return {
    get: jest.fn(),
  };
});

describe('FeatureFlagsService', () => {
  it('should fetch and return the feature flags', async () => {
    const mockFlags = {
      [PROJECT_ID]: {
        [FLAG_NAME]: true,
      },
    };
    featureFlags.get.mockResolvedValue(mockFlags);

    const service = await FeatureFlagsService.create(PROJECT_ID);

    expect(featureFlags.get).toHaveBeenCalledWith([PROJECT_ID]);
    expect(service.isEnabled(FLAG_NAME)).toBe(true);
  });
});
