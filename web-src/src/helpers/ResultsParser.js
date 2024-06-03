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

function objectToString(obj) {
  return String(obj).replace(/<\/?[^>]+(>|$)/g, '');
}

/**
 * Attempts to parse a potentially incomplete JSON string.
 *
 * @param {string} str - The JSON string to parse.
 * @returns {any} - The parsed JSON object, a best-effort fix if the input is incomplete,
 *                  or the original string if parsing fails.
 *
 * The function works as follows:
 * 1. Tries to parse the input string using `JSON.parse`.
 * 2. If parsing fails, it invokes an internal `fixJson` function:
 *    - Checks the first character to determine if the JSON represents an array or object.
 *    - Finds the last closing curly brace (`}`) in the string.
 *    - Truncates the string up to the last closing brace and attempts to close it correctly.
 *    - Parses the truncated string. If this fails, returns the original incomplete string.
 *    - If no closing brace is found, returns an empty object `{}` for objects or an empty array `[]` for arrays.
 */
const parseResponse = (str) => {
  const fixJson = (incomplete) => {
    const firstChar = incomplete.substring(0, 1);
    const isArray = firstChar === '[';
    const isObject = firstChar === '{';
    if (!isArray && !isObject) {
      return incomplete;
    } else {
      const lastClosingCurlyBrace = incomplete.lastIndexOf('}');
      if (lastClosingCurlyBrace === -1) {
        return isArray ? [] : {};
      } else {
        let truncated = incomplete.substring(0, lastClosingCurlyBrace + 1);
        truncated += isArray ? ']' : '}';
        try {
          return JSON.parse(truncated);
        } catch (e) {
          return incomplete;
        }
      }
    }
  };

  try {
    return JSON.parse(str);
  } catch (err) {
    return fixJson(str);
  }
};

export function createVariants(uuid, response) {
  try {
    const json = parseResponse(response);
    if (Array.isArray(json)) {
      return json.map((content) => ({ id: uuid(), content: content === null || typeof content !== 'object' ? objectToString(content) : content }));
    } else {
      return [{ id: uuid(), content: json }];
    }
  } catch (error) {
    return [{ id: uuid(), content: String(response) }];
  }
}
