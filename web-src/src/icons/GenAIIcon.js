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

export default function GenAIIcon(props) {
  return (
        <Icon {...props}>
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <style>
                        {`.fill {
            fill: 'var(--spectrum-global-color-gray-800)'};
          }`
          }
                    </style>
                </defs>
                <path
                    className={props?.color ? '' : 'fill'}
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.9339 0.269836L14.343 4.74512C14.2924 5.12874 14.4184 5.51464 14.6858 5.79436L17.5314 8.77145L13.4212 8.50595C13.0351 8.48102 12.6585 8.63249 12.3973 8.91782L9.34877 12.2473L9.93449 7.76772C9.98454 7.38488 9.85866 6.99996 9.59205 6.72068L6.75079 3.74435L10.8566 4.00849C11.2419 4.03328 11.6178 3.8823 11.879 3.5978L14.9339 0.269836Z"
                />
                <path
                    className={props?.color ? '' : 'fill'}
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.86006 10.1641L6.52175 12.7262C6.47509 13.0796 6.59123 13.4351 6.83754 13.6927L8.4553 15.3852L6.11852 15.2343C5.76288 15.2113 5.416 15.3508 5.17533 15.6137L3.43 17.5198L3.7654 14.9547C3.81151 14.602 3.69554 14.2474 3.44994 13.9901L1.83447 12.2979L4.16884 12.448C4.52386 12.4709 4.87014 12.3318 5.11072 12.0697L6.86006 10.1641Z"
                />
            </svg>
        </Icon>
  );
}
