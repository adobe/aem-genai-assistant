import {useIsFavorite} from './IsFavoriteHook.js';
import {useSetRecoilState} from 'recoil';
import {favoritesState} from './FavoritesState.js';
import {useCallback} from 'react';

export function useToggleFavorite() {
  const isFavorite = useIsFavorite();
  const setFavorites = useSetRecoilState(favoritesState);

  return useCallback((variant) => {
    setFavorites((favorites) => {
      if (isFavorite(variant)) {
        return favorites.filter((favorite) => favorite.id !== variant.id);
      } else {
        return [...favorites, variant];
      }
    });
  }, [isFavorite, setFavorites]);
}
