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

export class FeatureFlagsService {
  /*
   * The constructor is considered private and should not be called directly.
   * Use the static create method to create a new instance of the FeatureFlagsService.
   */
  constructor(flags = {}) {
    this.flags = flags;
  }

  isEnabled(flagName) {
    return this.flags[flagName];
  }

  /*
   * Create a new instance of the FeatureFlagsService for the given project.
   * @param {string} projectId - The project ID for which to get the feature flags.
   */
  static async create(projectId) {
    const flags = await featureFlags.get([projectId]);
    const projectFlags = flags[projectId];
    // We log the feature flags to the console for troubleshooting purposes.
    console.debug('Feature flags:', projectFlags);
    return new FeatureFlagsService(projectFlags);
  }
}
