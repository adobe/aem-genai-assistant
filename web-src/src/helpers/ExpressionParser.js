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
import nearley from 'nearley';
import grammar from './Parser.generated.js';

export const EXPRESSION_REGEX = /{{([@#]?)([^,}]+)[^{}]*}}/g;

export function parseExpression(expression) {
  return new nearley.Parser(nearley.Grammar.fromCompiled(grammar))
    .feed(expression)
    .results[0];
}

export function parseExpressions(text) {
  let order = 0;
  return Array.from(text.matchAll(EXPRESSION_REGEX)).reduce((expressions, [match]) => {
    try {
      const expression = parseExpression(match);

      if (!expression) {
        return expressions;
      }

      const { modifier, identifier, parameters } = expression;

      return {
        ...expressions,
        [identifier]: {
          ...(expressions[identifier] || {}),
          identifier,
          definition: modifier === '@',
          comment: modifier === '#',
          /* eslint-disable-next-line no-plusplus */
          ...(modifier === '@' ? { order: order++ } : {}),
          ...Array.from(parameters).reduce((params, { key, value }) => ({ ...params, [key]: value }), {}),
        },
      };
    } catch (e) {
      console.error(`Could not parse expression: ${match}`);
    }
    return expressions;
  }, {});
}
