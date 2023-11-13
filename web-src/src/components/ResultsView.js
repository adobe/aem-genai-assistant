import {ActionButton, Flex, Grid, Link, Text, Tooltip, TooltipTrigger, View, Well} from '@adobe/react-spectrum';
import ThumbUp from '@spectrum-icons/workflow/ThumbUp';
import ThumbDown from '@spectrum-icons/workflow/ThumbDown';
import Copy from '@spectrum-icons/workflow/Copy';
import Delete from '@spectrum-icons/workflow/Delete';
import React, {useEffect, useState} from 'react';
import {useRecoilValue} from 'recoil';
import {resultsState} from '../state/ResultsState.js';
import Star from '@spectrum-icons/workflow/Star';
import {PaddingBox} from '../helpers/StyleHelper.js';
import {VariantsView} from './VariantsView.js';

export function ResultsView(props) {
  const results = useRecoilValue(resultsState);

  return (
    <View
      {...props}
      overflow="auto">
      { results.map(({variants, prompt}) => <VariantsView variants={variants} prompt={prompt}/>) }
    </View>
  );
}
