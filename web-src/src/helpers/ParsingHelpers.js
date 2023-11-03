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
import wretch from 'wretch';
import {retry} from 'wretch/middlewares/retry';

export const EXPRESSION_REGEX = /\{(\w+)((?:,\s*\w+\s*=\s*[^,}]+)*)\}/g;

export async function parseSpreadSheet(url, valueColumnName = 'Value') {
  const json = await wretch(`${url}`).middlewares([retry({
    retryOnNetworkError: false,
  })]).get().json();

  return json.data.map((row) => {
    return {
      key: row.Key,
      value: row[valueColumnName],
    };
  });
}

function parseExpressionParams(paramsString) {
  if (paramsString) {
    return paramsString.trim().split(/\s*,\s*/).slice(1).reduce((params, paramPairString) => {
      const [name, value] = paramPairString.split(/\s*=\s*/);
      return { ...params, [name]: value };
    }, {});
  }
  return {};
}

export function parseExpressions(text) {
  return Array.from(text.matchAll(EXPRESSION_REGEX)).reduce((expressions, match) => {
    const [_, name, paramsString] = match;
    /* eslint-disable no-param-reassign */
    expressions[name] = { ...expressions[name], ...parseExpressionParams(paramsString) };
    return expressions;
  }, {});
}
