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

import React, { useEffect, useRef } from 'react';
import { View, IllustratedMessage, Heading, Content, Flex, Tooltip, TooltipTrigger, ActionButton, Well } from '@adobe/react-spectrum';
import Star from '@spectrum-icons/workflow/Star';
import StarOutline from '@spectrum-icons/workflow/StarOutline';
import Copy from '@spectrum-icons/workflow/Copy';
import Delete from '@spectrum-icons/workflow/Delete';

import WriteIcon from '../icons/WriteIcon';

function VariationsSection({variations, onFavorite, onCopy, onDelete}) {
  const scrollView = useRef(null);

  // useEffect(() => {
  //   if (variations) {
  //     const scrollable = scrollView.current && scrollView.current.UNSAFE_getDOMNode();
  //     scrollable.style.animation = "slide-in 0.5s forwards, fade-in 1s forwards";
  //     scrollable.style.transform = "translateY(50%)";
  //     if (variations.length > 0) {
  //       scrollable.scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"});
  //     }
  //   }
  // }, [variations]);

  return (
    <>
      {(variations.length === 0) ? (
        <IllustratedMessage>
          <WriteIcon />
          <Heading>Nothing here yet</Heading>
          <Content>Set up your prompt to generate new variations</Content>
        </IllustratedMessage>
      ) : (
        <View marginTop="size-300" marginBottom="size-300">
          <Flex direction="column" gap="size-300">
            {variations.length &&
              variations.map((variation) => (
                <View ref={scrollView}
                  borderRadius="regular"
                  paddingRight="24px"
                  key={variation.id}
                >
                  <Flex direction="row" gap="size-100" justifyContent="right">
                    <TooltipTrigger delay={0}>
                      <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer" onPress={() => onFavorite(variation.id)}>
                        {variation.isFavorite ? <Star /> : <StarOutline />}
                      </ActionButton>
                      <Tooltip>Save Variation</Tooltip>
                    </TooltipTrigger>
                    <TooltipTrigger delay={0}>
                      <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer" onPress={() => onCopy(variation.id)}>
                        <Copy />
                      </ActionButton>
                      <Tooltip>Copy to Clipboard</Tooltip>
                    </TooltipTrigger>
                    <TooltipTrigger delay={0}>
                      <ActionButton isQuiet UNSAFE_className="hover-cursor-pointer" onPress={() => onDelete(variation.id)}>
                        <Delete />
                      </ActionButton>
                      <Tooltip>Remove Variation</Tooltip>
                    </TooltipTrigger>
                  </Flex>
                  <Well UNSAFE_style={{ "whiteSpace": "pre-wrap" }}>{variation.content}</Well>
                </View>
              ))}
          </Flex>
        </View>
      )}
    </>
  )
}

export default VariationsSection;
