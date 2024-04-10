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

export default function DownloadIcon(props) {
  return (
    <Icon {...props}>
      <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="Frame">
          <path id="iconPrimary" d="M14.0303 9.42676C13.7383 9.13477 13.2637 9.13281 12.9697 9.42676L11.2529 11.1409V2.75C11.2529 2.33594 10.917 2 10.5029 2C10.0889 2 9.75294 2.33594 9.75294 2.75V11.1494L8.03028 9.42675C7.73731 9.13378 7.2627 9.13378 6.96973 9.42675C6.67676 9.71972 6.67676 10.1943 6.96973 10.4873L9.96778 13.4853C10.1143 13.6318 10.3057 13.7051 10.498 13.7051C10.6895 13.7051 10.8818 13.6318 11.0283 13.4853L14.0303 10.4873C14.3232 10.1953 14.3233 9.71973 14.0303 9.42676Z" fill="#292929" />
          <path id="iconPrimary_2" d="M16.25 18.0019H4.75C3.50977 18.0019 2.5 16.9922 2.5 15.7519V13.7305C2.5 13.3164 2.83594 12.9805 3.25 12.9805C3.66406 12.9805 4 13.3164 4 13.7305V15.7519C4 16.165 4.33691 16.5019 4.75 16.5019H16.25C16.6631 16.5019 17 16.165 17 15.7519V13.7305C17 13.3164 17.3359 12.9805 17.75 12.9805C18.1641 12.9805 18.5 13.3164 18.5 13.7305V15.7519C18.5 16.9922 17.4902 18.0019 16.25 18.0019Z" fill="#292929" />
        </g>
      </svg>
    </Icon>
  );
}
