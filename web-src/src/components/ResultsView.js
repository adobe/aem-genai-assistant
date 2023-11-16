import {ActionButton, Flex, Grid, Link, Text, Tooltip, TooltipTrigger, View, Image} from '@adobe/react-spectrum';
import React, {useCallback, useEffect, useState} from 'react';
import {useRecoilState, useRecoilValue} from 'recoil';
import {resultsState} from '../state/ResultsState.js';
import {ResultCard} from './ResultCard.js';

import EmptyResults from '../assets/empty-results.svg';
import {favoritesState} from '../state/FavoritesState.js';

export function ResultsView(props) {
  const results = useRecoilValue(resultsState);
  const [favorites, setFavorites] = useRecoilState(favoritesState);

  const isFavorite = useCallback((variant) => {
    return favorites.some((favorite) => favorite.id === variant.id);
  }, [favorites]);

  const makeFavorite = useCallback((variant) => {
    setFavorites((favorites) => {
      if (isFavorite(variant)) {
        return favorites.filter((favorite) => favorite.id !== variant.id);
      } else {
        return [...favorites, variant];
      }
    });
  }, [isFavorite, setFavorites]);

  return (
    <Flex
      {...props}
      direction={'column'}
      position={'absolute'}
      gap={'size-200'}
      width={'100%'}>
      { results.length === 0
        ? <Image src={EmptyResults} width={'600px'}></Image>
        : results.map(({variants, prompt}) =>
          <ResultCard
            variants={variants}
            prompt={prompt}
            isFavorite={isFavorite}
            makeFavorite={makeFavorite} />) }
    </Flex>
  );
}
