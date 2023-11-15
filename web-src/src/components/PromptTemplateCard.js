import {Grid, Text, Image} from '@adobe/react-spectrum';
import React from 'react';

import GenerateIcon from '../assets/generate.svg';
import SmallLogo from '../assets/logo_small.svg';
import {css} from '@emotion/css';

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
  `
}

export function PromptTemplateCard({ key, template, onClick, ...props }) {
  return (
    <a onClick={onClick}>
      <Grid
        {...props}
        key={key}
        UNSAFE_className={styles.card}
        alignItems={'center'}
        gap={5}
        areas={[
          'icon title logo',
          'description description description'
        ]}
        columns={['min-content', 'auto', 'min-content']}
        rows={['min-content', 'min-content']}>
        <Image src={GenerateIcon} width="24px" gridArea={'icon'}/>
        <Text UNSAFE_className={styles.title} gridArea={'title'}>{template.label}</Text>
        <Image src={SmallLogo} width={'18px'} gridArea={'logo'}/>
        <Text UNSAFE_className={styles.description} gridArea={'description'}>{template.description}</Text>
      </Grid>
    </a>
  )
}
