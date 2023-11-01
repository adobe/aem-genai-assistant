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

import React, { useState } from 'react';
import { View, IllustratedMessage, Heading, Content, Flex, Tooltip, TooltipTrigger, ActionButton, Well, CheckboxGroup, Checkbox, ActionBarContainer, ActionBar, Item, Text } from '@adobe/react-spectrum';
import Copy from '@spectrum-icons/workflow/Copy';
import Delete from '@spectrum-icons/workflow/Delete';
import Edit from '@spectrum-icons/workflow/Edit';

import WriteIcon from '../icons/WriteIcon';

function FavoritesSection({favorites, onCopy, onDelete, onBulkCopy, onBulkDelete}) {
  const [selectedKeys, setSelectedKeys] = useState([]);

  const actionCallback = (key) => {
    if (key === 'select-all') {
      setSelectedKeys(favorites.map((favorite) => favorite.id));
    } else if (key === 'copy-all') {
      onBulkCopy(selectedKeys);
    } else if (key === 'delete-all') {
      onBulkDelete(selectedKeys);
    }
  }
  
  return (
    <>
      {(favorites.length === 0) ? (
        <IllustratedMessage>
          <WriteIcon />
          <Heading>Nothing here yet</Heading>
          <Content>Favorite your generated favorites</Content>
        </IllustratedMessage>
      ) : (
        <ActionBarContainer height="size-900">
          <ActionBar
            isEmphasized
            selectedItemCount={selectedKeys.length}
            onAction={actionCallback}
            onClearSelection={() => setSelectedKeys([])}
          >
            <Item key="select-all">
              <Edit />
              <Text>Select All</Text>
            </Item>
            <Item key="copy-all">
              <Copy />
              <Text>Copy All</Text>
            </Item>
            <Item key="delete-all">
              <Delete />
              <Text>Delete All</Text>
            </Item>
          </ActionBar>
          <View marginTop="size-300">
            <Flex direction="column" gap="size-300">
              <CheckboxGroup value={selectedKeys} onChange={setSelectedKeys}>
                {favorites.length &&
                  favorites.map((favorite) => (
                    <View
                      paddingRight="size-300"
                      paddingBottom="size-300"
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
                          <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer" onPress={() => onDelete(favorite.id)}>
                            <Delete />
                          </ActionButton>
                          <Tooltip>Delete Saved Variation</Tooltip>
                        </TooltipTrigger>
                      </Flex>
                      <Flex direction="row" justifyContent="space-between" gap="size-10">
                        <Checkbox value={favorite.id} />
                        < Well UNSAFE_style={{ "whiteSpace": "pre-wrap" }}>{favorite.content}</Well>
                      </Flex>
                    </View>
                  ))}
              </CheckboxGroup>
            </Flex>
          </View>
        </ActionBarContainer>
      )}
    </>
  )
}

export default FavoritesSection;
