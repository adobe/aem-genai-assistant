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

export default function ThumbsDownOutlineIcon(props) {
  return (
    <Icon marginEnd={props.marginRight} {...props}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="Frame">
          <path id="iconPrimary" d="M16.9025 8.2747L15.0752 3.88545C14.5483 2.61982 13.3262 1.80068 11.9608 1.7998H3.8248C2.70816 1.7998 1.7998 2.7086 1.7998 3.82569V8.77569C1.7998 9.89189 2.70816 10.8007 3.8248 10.8007H5.68413C6.57491 10.8033 6.84165 11.9222 7.14619 13.6299C7.39888 15.0458 7.68496 16.6498 9.05825 16.6498C10.7238 16.6498 10.9149 15.3262 11.0195 14.602C11.0208 14.5914 11.205 12.3203 11.205 12.3203C11.2335 11.9731 11.5288 11.7007 11.8773 11.7007H14.6178C15.447 11.7007 16.2169 11.2885 16.677 10.5985C17.1372 9.90859 17.2215 9.04022 16.9025 8.2747ZM3.1498 8.77568V3.82568C3.1498 3.45302 3.45259 3.1498 3.8248 3.1498H4.7248V9.45068H3.8248C3.45259 9.45068 3.1498 9.14746 3.1498 8.77568ZM15.5538 9.8497C15.3416 10.1679 15.0005 10.3507 14.6178 10.3507H11.8773C10.8314 10.3507 9.94508 11.1672 9.85938 12.2104C9.85938 12.2104 9.68404 14.3831 9.68183 14.4218C9.55483 15.2998 9.44848 15.2875 9.03979 15.298C8.7981 15.2022 8.58013 13.9806 8.4751 13.3926C8.19835 11.8404 7.82482 9.75324 6.0748 9.48144V3.1498H11.9604C12.7787 3.15068 13.5121 3.64286 13.829 4.40399L15.6562 8.79325C15.8034 9.14657 15.7661 9.53153 15.5538 9.8497Z" fill="#292929" />
        </g>
      </svg>
    </Icon>
  );
}
