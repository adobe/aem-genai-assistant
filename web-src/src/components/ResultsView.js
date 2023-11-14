import {ActionButton, Flex, Grid, Link, Text, Tooltip, TooltipTrigger, View, Image} from '@adobe/react-spectrum';
import React, {useEffect, useState} from 'react';
import {useRecoilValue} from 'recoil';
import {resultsState} from '../state/ResultsState.js';
import {ResultsCard} from './ResultsCard.js';

import EmptyResults from '../assets/empty-results.svg';

export function ResultsView(props) {
  const results = useRecoilValue(resultsState);
  return (
    <Flex
      {...props}
      width={'100%'}
      height={'100%'}
      alignItems={'center'}
      justifyContent={'center'}
      overflow="auto">
      { !results || results.length === 0
        ? <img src={EmptyResults} width={'600px'}></img>
        : results.map(({variants, prompt}) => <ResultsCard variants={variants} prompt={prompt}/>) }
    </Flex>
  );
}
