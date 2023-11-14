import {Text, View} from '@adobe/react-spectrum';
import React from 'react';
import {css} from '@emotion/css';

const style = {
  card: css`
    padding: 10px;
    border: 1px solid #ccc;
  `
}

export function FavoriteCard({variant, ...props}) {
  return (
    <View
      {...props}
      UNSAFE_className={style.card}>
      <Text>{variant}</Text>
    </View>
  )
}
