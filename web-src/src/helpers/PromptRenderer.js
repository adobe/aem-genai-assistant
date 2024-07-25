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
    .filter((field) => field.type === 'text' || field.type === 'long-text')
    .map((field) => {
      return `\n- ${field.name}: ${field.description ?? field.label ?? ''}`;
    });

  fields.push('\n- variationName: The name assigned to the variation that should accurately represent the content\'s intent.');

  return '\n\nAdditional requirements: ```'
    + '\nThe response MUST be formatted as a JSON array.'
    + `\nEach element of MUST be a JSON object that includes the following fields: ${fields}`
    + '\n```';
}

export function insertAfterPosition(str, position, replacement) {
  const match = typeof position === 'string'
    ? position
    : (str.match(new RegExp(position.source, 'g')) || []).slice(-1)[0];
  if (!match) return str;
  const last = str.lastIndexOf(match);
  return last !== -1
    ? `${str.slice(0, last + match.length)}${replacement}${str.slice(last + match.length)}`
    : str;
}

export function renderPrompt(prompt, placeholders, contentFragmentModel, contentFragment) {
  let renderedPrompt = removeEmptyLines(resolvePlaceholders(prompt, placeholders));
  const additionalReqs = contentFragmentModel
    ? createContentModelPrompt(contentFragmentModel)
    : '';
  const sampleCfVar = contentFragment
    ? `\nThe following is an example of the expected response using the field values of the current content fragment. These values may be used to inform the generated content:\n[\n  {\n${contentFragment ? contentFragment.fields.map((field) => {
      return field.values[0] ? `    "${field.name}": "${field.values[0]}",\n` : '';
    }).join('') : ''}  },\n  ...\n]`
    : '';

  renderedPrompt = insertAfterPosition(renderedPrompt, '```', additionalReqs);
  renderedPrompt = insertAfterPosition(renderedPrompt, 'Additional Context: [[', sampleCfVar);

  return (
    renderedPrompt.replace('No domain knowledge or trusted source documents provided', '')
  );
}
