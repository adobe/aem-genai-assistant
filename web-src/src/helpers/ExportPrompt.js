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
export function toWord(prompt) {
    const table = document.createElement('table');
    table.setAttribute('border', '1');
    table.setAttribute('style', 'width:100%;');
  
    const headerRow = document.createElement('tr');
    headerRow.append(createTag('td', { colspan: maxCols, style: `background-color: ${getPreferedBackgroundColor()}; color: ${getPreferedForegroundColor()};` }, getAuthorFriendlyName(name)));
    table.append(headerRow);
    rows.forEach((row) => {
      const columns = [...row.children];
      const tr = document.createElement('tr');
      columns.forEach((col) => {
        const columnWidthPercentage = (1 / columns.length) * 100;
        const td = document.createElement('td');
        if (row.children.length < maxCols) {
          td.setAttribute('colspan', maxCols);
        } else {
          td.setAttribute('style', `width: ${columnWidthPercentage}%`);
        }
  
        prepareImagesForCopy(col, url, columnWidthPercentage);
  
        td.innerHTML = col.innerHTML;
  
        tr.append(td);
      });
      table.append(tr);
    });
    return table;
  }

export function toHTML(prompt) {
  return Object.entries(json).map(([key, value]) => {
    return `<b>${key}</b>: ${objectToString(value)}`;
  }).join('<br/>');
}