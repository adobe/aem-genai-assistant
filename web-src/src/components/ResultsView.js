import {Flex, Image} from '@adobe/react-spectrum';
import React from 'react';
import { css } from '@emotion/css';
import {useRecoilValue} from 'recoil';
import {resultsState} from '../state/ResultsState.js';
import {ResultCard} from './ResultCard.js';

import EmptyResults from '../assets/empty-results.svg';

export function ResultsView(props) {
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
        ? <Image src={EmptyResults} width={'600px'} UNSAFE_className={style.emptyResults}></Image>
        : results.map(result => <ResultCard result={result} />)
      }
    </Flex>
  );
}
