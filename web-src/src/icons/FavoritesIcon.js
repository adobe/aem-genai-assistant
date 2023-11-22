/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import React from 'react';
import { Icon } from '@adobe/react-spectrum';

export default function FavoritesIcon(props) {
  return (
    <Icon marginEnd={props.marginRight} {...props}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="Frame">
          <path id="iconPrimary" d="M14.4423 18.499C14.1323 18.499 13.8217 18.4092 13.5468 18.229L11.1757 16.6719C10.4628 16.2031 9.49458 16.2031 8.78071 16.6719L6.4101 18.229C5.83783 18.605 5.11078 18.5869 4.55707 18.185C4.00336 17.7832 3.76264 17.0967 3.94281 16.4365L4.90326 12.9228C5.00385 12.5556 4.87689 12.1645 4.58002 11.9268L1.73725 9.64892C1.20307 9.2207 0.995063 8.52343 1.20649 7.87255C1.4184 7.22216 1.99653 6.78075 2.67963 6.74853L6.31781 6.57617C6.69818 6.55859 7.0307 6.31689 7.16547 5.96045L8.45404 2.55322C8.69574 1.91357 9.29388 1.50049 9.97797 1.5C10.6621 1.5 11.2607 1.91357 11.5029 2.55322L12.791 5.96045C12.9257 6.3169 13.2583 6.55859 13.6386 6.57617L17.2773 6.74853C17.9604 6.78076 18.5385 7.22216 18.7504 7.87304C18.9619 8.52392 18.7534 9.2207 18.2192 9.64892L15.3769 11.9268C15.08 12.1645 14.9531 12.5557 15.0537 12.9224L16.0141 16.437C16.1943 17.0967 15.9531 17.7832 15.3998 18.1851C15.1122 18.394 14.7778 18.499 14.4423 18.499Z" fill="#292929" />
        </g>
      </svg>
    </Icon>
  );
}
