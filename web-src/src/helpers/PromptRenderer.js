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
import { EXPRESSION_REGEX } from './ExpressionParser.js';

export const NO_VALUE_STRING = '<please_select>';

function isBlankValue(value) {
  if (typeof value === 'number') {
    return false;
  } else if (typeof value === 'string') {
    return value.trim() === '';
  }
  return value === null || value === undefined;
}

function resolvePlaceholders(str, valuesMap) {
  return str.replace(EXPRESSION_REGEX, (match) => {
    const [[_, modifier, identifier]] = match.matchAll(EXPRESSION_REGEX);
    if (modifier === '#' || modifier === '@') {
      return '';
    }
    /* eslint-disable-next-line no-nested-ternary */
    return identifier in valuesMap
      ? (isBlankValue(valuesMap[identifier]) ? NO_VALUE_STRING : valuesMap[identifier])
      : NO_VALUE_STRING;
  });
}

function removeEmptyLines(text) {
  return text.replace(/\n\s*\n/g, '\n\n').trim();
}

export function createContentModelPrompt(contentFragmentModel) {
  const fields = contentFragmentModel.fields
    .map((field) => {
      if (field.type !== 'text') {
        return null;
      }
      return `\n- ${field.name}: ${field.description ?? field.label ?? ''}`;
    })
    .filter((field) => field !== null);

  fields.push('\n- variationName: The name of the variation to be created.');

  return '\n\nAdditional requirements: ```'
    + '\nThe response MUST be formatted as a JSON array.'
    + `\nEach element of MUST be a JSON object that includes the following fields: ${fields}`
    + '\n```';
}

export function renderPrompt(prompt, placeholders, contentFragmentModel) {
  const extraPrompt = contentFragmentModel ? createContentModelPrompt(contentFragmentModel) : '';
  return removeEmptyLines(resolvePlaceholders(prompt, placeholders)) + extraPrompt;
}
