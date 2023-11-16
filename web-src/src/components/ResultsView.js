import {Flex, Image} from '@adobe/react-spectrum';
import React from 'react';
import {useRecoilValue} from 'recoil';
import {resultsState} from '../state/ResultsState.js';
import {ResultCard} from './ResultCard.js';

import EmptyResults from '../assets/empty-results.svg';

export function ResultsView(props) {
  const results = useRecoilValue(resultsState);

  return (
    <Flex
      {...props}
      direction={'column'}
      position={'absolute'}
      gap={'size-200'}
      width={'100%'}>
      { results.length === 0
        ? <Image src={EmptyResults} width={'600px'}></Image>
        : results.map(result => <ResultCard result={result} />)
      }
    </Flex>
  );
}
