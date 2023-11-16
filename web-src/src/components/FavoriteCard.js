import {ActionButton, Flex, Text, Tooltip, TooltipTrigger, View} from '@adobe/react-spectrum';
import React from 'react';
import {css} from '@emotion/css';
import Copy from '@spectrum-icons/workflow/Copy';
import Delete from '@spectrum-icons/workflow/Delete';
import {useToggleFavorite} from '../state/ToggleFavoriteHook.js';

const styles = {
  card: css`
    padding: 10px;
    margin: 10px;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
  `,
  variant: css`
    padding: 10px;
    min-height: 100px;
  `,
}

export function FavoriteCard({variant, ...props}) {
  const toggleFavorite = useToggleFavorite();

  return (
    <View
      {...props}
      UNSAFE_className={styles.card}>
      <div className={styles.variant}>{variant.content}</div>
      <View
        borderRadius="regular"
        paddingRight="24px">
        <Flex direction="row" gap="size-100" justifyContent="left">
          <TooltipTrigger delay={0}>
            <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer">
              <Copy />
            </ActionButton>
            <Tooltip>Copy</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0}>
            <ActionButton
              isQuiet U
              NSAFE_className="hover-cursor-pointer"
              onPress={() => toggleFavorite(variant)}>
              <Delete />
            </ActionButton>
            <Tooltip>Remove</Tooltip>
          </TooltipTrigger>
        </Flex>
      </View>
    </View>
  )
}