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
import {
  Grid, Text, Image, Item, ActionMenu,
} from '@adobe/react-spectrum';
import React, { Fragment, useCallback } from 'react';

import { css } from '@emotion/css';
import { motion } from 'framer-motion';
import SharedTemplateIcon from '@spectrum-icons/workflow/UserGroup';
import DeleteIcon from '@spectrum-icons/workflow/Delete';
import GenerateIcon from '../assets/generate.svg';
import SmallLogo from '../assets/logo_small.svg';
import { NEW_PROMPT_TEMPLATE_ID } from '../state/PromptTemplatesState.js';

const styles = {
  card: css`
    padding: 15px;
    border: 1px #e0e0e0 solid;
    border-radius: 10px;
    height: 200px;
    overflow: hidden;
    &:hover {
      cursor: pointer;
      border-color: blue;
    }
  `,
  title: css`
    text-overflow: ellipsis;
    overflow: hidden;
    font-weight: bold;
  `,
  description: css`
    overflow: hidden;
    color: #555;
    align-self: start;
  `,
  status: css`
    filter: invert(40%) sepia(0%) saturate(2%) hue-rotate(102deg) brightness(96%) contrast(86%);
  `,
  actions: css`
    grid-area: actions;
    align-self: center;
    justify-self: end;
  `,
};

function isSystemTemplate(template) {
  return template.isBundled || template.id === NEW_PROMPT_TEMPLATE_ID;
}

function isParentNode(node, parent) {
  let currentNode = node;
  while (currentNode !== null) {
    if (currentNode === parent) {
      return true;
    }
    currentNode = currentNode.parentNode;
  }
  return false;
}

export function PromptTemplateCard({
  template, onClick, onDelete, ...props
}) {
  const cardNodeRef = React.useRef(null);

  const handleClick = useCallback((e) => {
    if (isParentNode(e.target, cardNodeRef.current.UNSAFE_getDOMNode())) {
      setTimeout(() => {
        onClick(template);
      }, 0);
    }
  }, [onClick]);

  const handleAction = useCallback((action) => {
    if (action === 'delete') {
      onDelete(template);
    }
  }, [template, onDelete]);

  const renderActions = () => {
    if (isSystemTemplate(template)) {
      return null;
    }
    return (
      <ActionMenu isQuiet onAction={handleAction} UNSAFE_className={styles.actions}>
        <Item key={'delete'} textValue={'Delete'}>
          <DeleteIcon color={'negative'} UNSAFE_style={{ boxSizing: 'content-box' }}/>
          <Text UNSAFE_style={{ color: 'red' }}>Delete</Text>
        </Item>
      </ActionMenu>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0.3, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ ease: 'easeInOut', duration: 0.3 }}>
      <a onClick={handleClick}>
        <Grid
          {...props}
          data-testid={'prompt-template-card'}
          UNSAFE_className={styles.card}
          alignItems={'center'}
          gap={10}
          areas={[
            'icon title logo',
            'description description description',
            'status actions actions',
          ]}
          ref={cardNodeRef}
          columns={['min-content', 'auto', 'min-content']}
          rows={['min-content', 'auto', 'min-content']}>
          <Image src={GenerateIcon} width="24px" alt={''} gridArea={'icon'} alignSelf={'start'}/>
          <Text UNSAFE_className={styles.title} gridArea={'title'}>{template.label}</Text>
          {(template.isBundled) ? <Image src={SmallLogo} width={'18px'} alt={''} gridArea={'logo'}/> : <Fragment/>}
          <Text UNSAFE_className={styles.description} gridArea={'description'}>{template.description}</Text>
          {(!isSystemTemplate(template) && template.isPublic)
            && <SharedTemplateIcon size={'S'} gridArea={'status'} UNSAFE_className={styles.status}/>}
          {renderActions()}
        </Grid>
      </a>
    </motion.div>
  );
}
