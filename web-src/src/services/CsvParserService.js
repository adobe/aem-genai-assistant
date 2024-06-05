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
import QueryStringAddon from 'wretch/addons/queryString';
import { wretch } from '../helpers/NetworkHelper.js';

export class CsvParserService {
  constructor({
    csvParserEndpoint,
    imsOrg,
    accessToken,
  }) {
    this.csvParserEndpoint = csvParserEndpoint;
    this.imsOrg = imsOrg;
    this.accessToken = accessToken;

    console.log('csvParserEndpoint', csvParserEndpoint);
  }

  async getData(url) {
    const json = await wretch(this.csvParserEndpoint)
      .auth(`Bearer ${this.accessToken}`)
      .headers({
        'x-gw-ims-org-id': this.imsOrg,
      })
      .addon(QueryStringAddon)
      .query({ url })
      .get()
      .json();
    return Array.from(json).map(([key, value]) => {
      return {
        key,
        value,
      };
    });
  }
}
