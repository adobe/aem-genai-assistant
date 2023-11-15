import {Text, View} from '@adobe/react-spectrum';
import React from 'react';
import {css} from '@emotion/css';

const style = {
  card: css`
    padding: 10px;
    border: 1px solid #ccc;
    height: 100%;
    border-radius: 10px; 
  `
}

export function FavoriteCard({variant, ...props}) {
  return (
    <View
      {...props}
      UNSAFE_className={style.card}>
      <Text>{variant.content}</Text>
    </View>
  )
}
