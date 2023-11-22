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
import { Grid, Text, Image } from '@adobe/react-spectrum';
import React, { Fragment } from 'react';

import { css } from '@emotion/css';
import { motion } from 'framer-motion';
import GenerateIcon from '../assets/generate.svg';
import SmallLogo from '../assets/logo_small.svg';

const styles = {
  card: css`
    padding: 20px;
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
    white-space: nowrap;
    overflow: hidden;
  `,
  description: css`
    overflow: hidden;
    color: #999999;
  `,
};

export function PromptTemplateCard({
  template, onClick, ...props
}) {
  return (
    <a onClick={onClick}>
      <motion.div
        initial={{ opacity: 0.3, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ ease: 'easeInOut', duration: 0.3 }}>
        <Grid
          {...props}
          UNSAFE_className={styles.card}
          alignItems={'center'}
          gap={5}
          areas={[
            'icon title logo',
            'description description description',
          ]}
          columns={['min-content', 'auto', 'min-content']}
          rows={['min-content', 'min-content']}>
          <Image src={GenerateIcon} width="24px" gridArea={'icon'}/>
          <Text UNSAFE_className={styles.title} gridArea={'title'}>{template.label}</Text>
          { (template.isBundled) ? <Image src={SmallLogo} width={'18px'} gridArea={'logo'}/> : <Fragment/> }
          <Text UNSAFE_className={styles.description} gridArea={'description'}>{template.description}</Text>
        </Grid>
      </motion.div>
    </a>
  );
}
