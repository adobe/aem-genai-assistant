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
export function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const dateStr = date.toLocaleDateString('en-US');
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
  return `${dateStr} ${timeStr}`;
}

export function formatIdentifier(name) {
  let label = name.replace(/[_-]/g, ' ');
  label = label.replace(/([a-z])([A-Z])/g, (match, p1, p2) => `${p1} ${p2}`);
  const words = label.trim().split(/\s+/);
  return words.map((word, index) => {
    if (index === 0) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return word.charAt(0).toLowerCase() + word.slice(1);
  }).join(' ');
}

export function newGroupingLabelGenerator() {
  let prevLabel = null;

  return (inputDate) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const date = new Date(inputDate);

    // Calculate the difference in days
    const msPerDay = 24 * 60 * 60 * 1000;
    const dayDifference = (today - new Date(date.getFullYear(), date.getMonth(), date.getDate())) / msPerDay;

    let label;
    if (dayDifference < 1) {
      label = 'formatHelperTodayLabel';
    } else if (dayDifference < 2) {
      label = 'formatHelperYesterdayLabel';
    } else if (dayDifference < 7) {
      label = 'formatHelperLast7DaysLabel';
    } else if (dayDifference < 30) {
      label = 'formatHelperLast30DaysLabel';
    } else if (dayDifference < 90) {
      label = 'formatHelperLast90DaysLabel';
    } else if (dayDifference < 180) {
      label = 'formatHelperLast6MonthsLabel';
    } else if (dayDifference < 365) {
      label = 'formatHelperLast12MonthsLabel';
    } else {
      label = 'formatHelperOlderLabel';
    }

    if (label !== prevLabel) {
      prevLabel = label;
      return label;
    }

    // Return null if the label hasn't changed
    return null;
  };
}

// returns the localization id from the given string, if found
export function extractL10nId(str) {
  const result = str?.match(/{{(.*?)}}/);
  return result ? result[1] : undefined;
}

// replaces localization id in the original error message with the localized error
export function handleLocalizedResponse(message, localizedError) {
  if (localizedError && message && message.includes('{{')) {
    return message.substring(0, message.indexOf('{{')) + localizedError + message.substring(message.indexOf('}}') + 2, message.length);
  }

  return message;
}
