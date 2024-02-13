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

export default function EditIcon(props) {
  return (
    <Icon {...props}>
      <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="Frame">
          <path id="iconPrimary" d="M18.2811 1.75837C17.0092 0.717349 15.0541 0.859929 13.8309 2.08161L3.57802 12.3355C3.25771 12.6548 3.01943 13.0523 2.88906 13.4859L1.50478 18.0699C1.4247 18.3345 1.49697 18.6216 1.69228 18.8169C1.83486 18.9595 2.02675 19.0367 2.22255 19.0367C2.29482 19.0367 2.36806 19.0259 2.43935 19.0044L7.02187 17.6207C7.45546 17.4908 7.85341 17.2525 8.17275 16.9322C8.17275 16.9322 18.3412 6.76421 18.5282 6.57671C19.1762 5.92925 19.5214 5.03179 19.476 4.11675C19.4301 3.20171 18.9945 2.34138 18.2811 1.75837ZM3.34511 17.1646L4.32509 13.9185C4.35225 13.8282 4.39223 13.7427 4.43886 13.6612L6.84755 16.0704C6.76601 16.1168 6.68037 16.1568 6.58974 16.1842L3.34511 17.1646ZM17.4667 5.51716C17.312 5.67268 10.3668 12.6173 7.94124 15.043L5.46663 12.5679L14.8915 3.14215C15.2777 2.75543 15.7875 2.55621 16.2811 2.55621C16.662 2.55621 17.0336 2.67535 17.3314 2.91851C17.723 3.2398 17.9525 3.69097 17.9774 4.19097C18.0023 4.68413 17.8163 5.16755 17.4667 5.51716Z" fill="#292929" />
        </g>
      </svg>
    </Icon>
  );
}
