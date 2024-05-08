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

import settings, { SettingsLevel } from '@adobe/exc-app/settings';

export async function readValueFromSettings(groupId, defaultValue, isShared) {
  try {
    const data = await settings.get({
      groupId,
      level: isShared ? SettingsLevel.ORG : SettingsLevel.USER,
      settings: defaultValue,
    });
    return data.settings;
  } catch (err) {
    console.error(`Error reading data from ${groupId}`, err);
    throw new Error('Error reading data from settings', err);
  }
}

export async function writeValueToSettings(groupId, newValue, isShared) {
  try {
    const oldValue = await readValueFromSettings(groupId, {}, isShared);
    console.log('oldValue', oldValue);
    await settings.set({
      groupId,
      level: isShared ? SettingsLevel.ORG : SettingsLevel.USER,
      settings: {
        ...oldValue,
        ...newValue,
      },
    });
  } catch (err) {
    console.error(`Error writing data to ${groupId}`, err);
    throw new Error('Error writing data to settings', err);
  }
}
