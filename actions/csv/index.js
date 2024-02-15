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
const wretch = require('wretch');
const Papa = require('papaparse');
const { asGenericAction } = require('../GenericAction.js');

async function main({ csv }) {
  const text = await wretch(csv).get().text();
  const { data } = Papa.parse(text, {});
  return data;
}

exports.main = asGenericAction(main);
