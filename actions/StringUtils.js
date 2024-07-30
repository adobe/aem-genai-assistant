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
export function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  let truncated = text.substring(0, maxLength);

  // Find the last period in the truncated string
  const lastPeriod = truncated.lastIndexOf('.');

  // If there's a period, cut off at that point
  if (lastPeriod !== -1) {
    truncated = truncated.substring(0, lastPeriod + 1);
  } else {
    // If no period is found, look for the last space
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace !== -1) {
      truncated = `${truncated.substring(0, lastSpace)}...`;
    } else {
      // If no space is found, just add ellipsis to the end
      truncated += '...';
    }
  }

  return truncated;
}
