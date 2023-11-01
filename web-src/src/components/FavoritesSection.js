/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React, { useEffect, useState } from 'react';
import { View, IllustratedMessage, Heading, Content, Flex, Tooltip, TooltipTrigger, ActionButton, Well } from '@adobe/react-spectrum';
import Copy from '@spectrum-icons/workflow/Copy';
import Delete from '@spectrum-icons/workflow/Delete';

import WriteIcon from '../icons/WriteIcon';

function FavoritesSection({favorites, onCopy, onDelete}) {
  return (
    <>
      {(favorites.length === 0) ? (
        <IllustratedMessage>
          <WriteIcon />
          <Heading>Nothing here yet</Heading>
          <Content>Favorite your generated favorites</Content>
        </IllustratedMessage>
      ) : (
        <View marginTop="size-300">
          <Flex direction="column" gap="size-300">
            {favorites.length &&
              favorites.map((favorite) => (
                <View
                  borderRadius="regular"
                  paddingRight="24px"
                  key={favorite.id}
                >
                  <Flex direction="row" gap="size-100" justifyContent="right">
                    <TooltipTrigger delay={0}>
                      <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer" onPress={() => onCopy(favorite.id)}>
                        <Copy />
                      </ActionButton>
                      <Tooltip>Copy to Clipboard</Tooltip>
                    </TooltipTrigger>
                    <TooltipTrigger delay={0}>
                      <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer" onPress={()=> onDelete(favorite.id)}>
                        <Delete />
                      </ActionButton>
                      <Tooltip>Remove favorite</Tooltip>
                    </TooltipTrigger>
                  </Flex>
                  <Well UNSAFE_style={{ "whiteSpace": "pre-wrap" }}>{favorite.content}</Well>
                </View>
              ))}
          </Flex>
        </View>
      )}
    </>
  )
}

export default FavoritesSection;
