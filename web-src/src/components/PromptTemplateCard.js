 import {Grid, Text, Image} from '@adobe/react-spectrum';
import React from 'react';

import GenerateIcon from '../assets/generate.svg';
import SmallLogo from '../assets/logo_small.svg';

export function PromptTemplateCard({ key, template, onClick, ...props }) {
  return (
    <a onClick={onClick}>
      <Grid
        {...props}
        key={key}
        alignItems={'center'}
        UNSAFE_style={{ padding: '20px', border: '1px #e0e0e0 solid', borderRadius: '10px' }}
        height={'200px'}
        gap={'10px'}
        areas={[
          'icon title logo',
          'description description description'
        ]}
        columns={['min-content', 'auto', 'min-content']}
        rows={['min-content', 'min-content']}>
        <Image src={GenerateIcon} width="24px" gridArea={'icon'}/>
        <Text gridArea={'title'}>{template.label}</Text>
        <Image src={SmallLogo} width={'18px'} gridArea={'logo'}/>
        <Text style={{ color: '#999999', padding: '10px', textOverflow: 'fade', overflow: 'hidden' }} gridArea={'description'}>{template.description}</Text>
      </Grid>
    </a>
  )
}
