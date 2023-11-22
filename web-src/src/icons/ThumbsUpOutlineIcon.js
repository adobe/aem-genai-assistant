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

export default function ThumbsUpOutlineIcon(props) {
  return (
    <Icon marginEnd={props.marginRight} {...props}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="Frame">
          <path id="iconPrimary" d="M16.6771 7.40234C16.2169 6.7124 15.447 6.3002 14.6178 6.3002H11.8773C11.5289 6.3002 11.2336 6.02774 11.205 5.68056L11.0248 3.53867C11.0266 3.49209 11.023 3.41474 11.0151 3.36904C10.9149 2.78105 10.6798 1.40381 9.05825 1.40381C7.72451 1.40381 7.44766 2.90586 7.18003 4.35957C6.87418 6.02158 6.58765 7.19756 5.68589 7.2002H3.8248C2.70816 7.2002 1.7998 8.10899 1.7998 9.22519V14.1752C1.7998 15.2914 2.70816 16.2002 3.8248 16.2002H10.5748C10.6056 16.2002 10.6359 16.1984 10.6653 16.194H11.9613C13.328 16.1932 14.5501 15.3767 15.0752 14.1154L16.9025 9.72617C17.2215 8.96064 17.1372 8.09228 16.6771 7.40234ZM3.14981 14.1752V9.22519C3.14981 8.85341 3.4526 8.5502 3.82481 8.5502H4.72481V14.8502H3.82481C3.4526 14.8502 3.14981 14.547 3.14981 14.1752ZM15.6562 9.20762L13.829 13.5969C13.5139 14.3536 12.7804 14.8432 11.9609 14.844H10.5748C10.5441 14.844 10.5137 14.8458 10.4843 14.8502H6.07482V8.52009C7.83505 8.25005 8.22128 6.15869 8.50807 4.6039C8.61838 4.00361 8.82448 2.88564 9.05827 2.75381C9.38303 2.75381 9.53464 2.75381 9.67526 3.54395C9.6757 3.55713 9.67615 3.57032 9.67702 3.58086L9.85939 5.79131C9.94508 6.83369 10.8315 7.6502 11.8774 7.6502H14.6178C15.0006 7.6502 15.3416 7.833 15.5538 8.15117C15.7661 8.46934 15.8034 8.8543 15.6562 9.20762Z" fill="#292929" />
        </g>
      </svg>
    </Icon>
  );
}
