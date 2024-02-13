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

export async function readData(groupId, defaultValue) {
  try {
    const data = await settings.get({
      groupId,
      level: SettingsLevel.USERORG,
      settings: defaultValue,
    });
    console.log(`Value for ${groupId} is ${JSON.stringify(data)}`);
    return data.settings;
  } catch (err) {
    console.log(err);
    throw new Error('Error reading data', err);
  }
}

export async function writeData(groupId, value) {
  try {
    await settings.set({
      groupId,
      level: SettingsLevel.USERORG,
      settings: value,
    });
  } catch (err) {
    console.log(err);
  }
}
