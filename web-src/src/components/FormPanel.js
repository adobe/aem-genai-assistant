import {ActionButton, Flex, Grid, Heading, Image, Link, Text, View} from '@adobe/react-spectrum';
import {ParametersView} from './ParametersView.js';
import {CreativitySlider} from './CreativitySlider.js';
import {GenerateButton} from './GenerateButton.js';
import React from 'react';

import GenerateIcon from '../assets/generate.svg';
import ResetIcon from '../assets/reset.svg';
import {useRecoilValue} from 'recoil';
import {promptTemplateState} from '../state/PromptTemplateState.js';

export function FormPanel(props) {
  const promptTemplate = useRecoilValue(promptTemplateState);
  return (
    <Grid
      {...props}
      areas={['breadcrumbs', 'info', 'form', 'buttons']}
      columns={['auto']}
      rows={['min-content', 'min-content', '1fr', 'min-content']}
      gap={'size-100'}>
      <Flex direction={'row'} justifyContent={'space-between'} alignItems={'center'} gridArea={'breadcrumbs'}>
        <Link>Prompts</Link>
      </Flex>
      <Flex UNSAFE_style={{ borderBottom: '1px solid #a0a0a0'}} direction={'column'} justifyContent={'stretch'} alignItems={'stretch'} gridArea={'info'}>
        <Flex UNSAFE_style={{ borderRadius: '8px', background: '#E0F2FF', padding: '10px' }} gap={'size-100'} alignItems={'center'}>
          <Image src={GenerateIcon} width={'24px'}/>
          <Text>{ promptTemplate ? promptTemplate.key : 'Empty' }</Text>
        </Flex>
        <Text>lorem ipsum</Text>
      </Flex>
      <ParametersView/>
      <Flex direction={'row'} justifyContent={'space-between'} alignItems={'center'} gridArea={'buttons'}>
        <ActionButton><Image src={ResetIcon}/>Reset</ActionButton>
        <GenerateButton/>
      </Flex>
    </Grid>
  )
}
