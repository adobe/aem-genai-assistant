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
    height: 150px;
    &:hover {
      cursor: pointer;
      border-color: blue;
    }
  `,
  title: css`
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    &:hover {
      color: #000000;
    }
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
        gap={'10px'}
        areas={[
          'icon title logo',
          'description description description'
        ]}
        columns={['min-content', 'auto', 'min-content']}
        rows={['min-content', 'min-content']}>
        <Image src={GenerateIcon} width="24px" gridArea={'icon'}/>
        <Text gridArea={'title'} UNSAFE_className={styles.title}>{template.label}</Text>
        <Image src={SmallLogo} width={'18px'} gridArea={'logo'}/>
        <Text style={{ color: '#999999', padding: '10px', textOverflow: 'fade', overflow: 'hidden' }} gridArea={'description'}>{template.description}</Text>
      </Grid>
    </a>
  )
}
