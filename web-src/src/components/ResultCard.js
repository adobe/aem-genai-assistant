import {ActionButton, Flex, Grid, Link, Text, Tooltip, TooltipTrigger, View, Well} from '@adobe/react-spectrum';
import ThumbUp from '@spectrum-icons/workflow/ThumbUp';
import ThumbDown from '@spectrum-icons/workflow/ThumbDown';
import Copy from '@spectrum-icons/workflow/Copy';
import Delete from '@spectrum-icons/workflow/Delete';
import React, {useState} from 'react';
import Star from '@spectrum-icons/workflow/Star';
import {PaddingBox} from '../helpers/StyleHelper.js';

export function ResultCard({variants, prompt, isFavorite, makeFavorite, ...props}) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);

  return (
    <Grid
      {...props}
      UNSAFE_style={{ padding: '10px', margin: '10px', border: '1px solid #e0e0e0', borderRadius: '10px'}}
      areas={['prompt', 'variations', 'current', 'buttons']}
      columns={['1fr']}
      rows={['min-content', 'min-content', 'min-content', 'min-content']}>
      <Text UNSAFE_style={PaddingBox}>{prompt}</Text>
      <Flex direction={'row'} gap={'size-100'} justifyContent={'left'} UNSAFE_style={{ overflowX: 'auto' }}>
        {
          variants.map((variant) => {
            return (
              <a onClick={() => setSelectedVariant(variant)}>
                <Well>{variant.content}</Well>
              </a>
            )
          })
        }
      </Flex>
      <Flex direction={'column'} UNSAFE_style={PaddingBox}>
        <Text>{selectedVariant.content}</Text>
      </Flex>
      <View
        borderRadius="regular"
        paddingRight="24px">
        <Flex direction="row" gap="size-100" justifyContent="left">
          <TooltipTrigger delay={0}>
            <ActionButton
              isQuiet
              isDisabled={isFavorite(selectedVariant)}
              onPress={() => makeFavorite(selectedVariant)}
              UNSAFE_className="hover-cursor-pointer">
              <Star />
            </ActionButton>
            <Tooltip>Save</Tooltip>
          </TooltipTrigger>
          <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer">
            <ThumbUp />
          </ActionButton>
          <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer">
            <ThumbDown />
          </ActionButton>
          <TooltipTrigger delay={0}>
            <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer">
              <Copy />
            </ActionButton>
            <Tooltip>Copy to Clipboard</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0}>
            <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer">
              <Delete />
            </ActionButton>
            <Tooltip>Remove</Tooltip>
          </TooltipTrigger>
        </Flex>
      </View>
    </Grid>
  )
}
