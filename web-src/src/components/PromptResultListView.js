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
import { Flex, Image } from '@adobe/react-spectrum';
import React from 'react';
import { css } from '@emotion/css';
import { useRecoilValue } from 'recoil';
import { resultsState } from '../state/ResultsState.js';
import { PromptResultCard } from './PromptResultCard.js';

import EmptyResults from '../assets/empty-results.svg';

export function PromptResultListView(props) {
  const results = useRecoilValue(resultsState);

  const style = {
    emptyResults: css`
      position: absolute;
      top: 40px;
      left: 50%;
      transform: translateX(-50%);
    `,
  };

  return (
    <Flex
      {...props}
      direction={'column'}
      position={'absolute'}
      gap={'size-200'}
      width={'100%'}>
      { results.length === 0
        ? <Image src={EmptyResults} width={'600px'} UNSAFE_className={style.emptyResults} alt={'Empty'}></Image>
        : results.map((result) => <PromptResultCard key={result.id} result={result} />)
      }
    </Flex>
  );
}
