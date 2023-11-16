import {useRecoilValue} from 'recoil';
import {favoritesState} from './FavoritesState.js';
import {useCallback} from 'react';

export function useIsFavorite() {
  const favorites = useRecoilValue(favoritesState);

  return useCallback(variant => {
    return favorites.some((favorite) => favorite.id === variant.id);
  }, [favorites]);
}
