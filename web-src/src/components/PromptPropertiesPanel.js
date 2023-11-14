import {Flex, Grid, Image, Link, Text} from '@adobe/react-spectrum';
import {InputsView} from './InputsView.js';
import {TemperatureSelector} from './TemperatureSelector.js';
import {GenerateButton} from './GenerateButton.js';
import React from 'react';

import GenerateIcon from '../assets/generate.svg';
import {useRecoilValue} from 'recoil';
import {expressionsState} from '../state/ExpressionsState.js';
import {ResetButton} from './ResetButton.js';
import {currentSessionState} from '../state/CurrentSessionState.js';

export function PromptPropertiesPanel(props) {
  const currentSession = useRecoilValue(currentSessionState);
  const expressions = useRecoilValue(expressionsState);

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

      { currentSession ?
        <Flex UNSAFE_style={{ borderBottom: '1px solid #a0a0a0'}} direction={'column'} justifyContent={'stretch'} alignItems={'stretch'} gridArea={'info'}>
          <Flex UNSAFE_style={{ borderRadius: '8px', background: '#E0F2FF', padding: '10px' }} gap={'size-100'} alignItems={'center'}>
            <Image src={GenerateIcon} width={'24px'}/>
            <Text>{ currentSession.name ?? 'Empty' }</Text>
          </Flex>
          <Text UNSAFE_style={{ padding: '10px' }}>{ currentSession.description ?? 'Empty' }</Text>
        </Flex>
        : <div></div>
      }

      <Flex direction={'column'}>
        <h3>Inputs</h3>
        { Object.keys(expressions).length > 0 &&
          <Flex direction={'column'} UNSAFE_style={{ position: 'relative', height: '100%' }}>
            <InputsView/>
          </Flex>
        }
        <TemperatureSelector/>
      </Flex>

      <Flex direction={'row'} justifyContent={'space-between'} alignItems={'center'} gridArea={'buttons'}>
        <ResetButton/>
        <GenerateButton/>
      </Flex>

    </Grid>
  )
}
