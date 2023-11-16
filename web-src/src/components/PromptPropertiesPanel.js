import {Flex, Grid, Image, Link, Text} from '@adobe/react-spectrum';
import {InputsView} from './InputsView.js';
import {GenerateButton} from './GenerateButton.js';
import React from 'react';

import GenerateIcon from '../assets/generate.svg';
import {useRecoilValue} from 'recoil';
import {ResetButton} from './ResetButton.js';
import {currentSessionState} from '../state/CurrentSessionState.js';
import {css} from '@emotion/css';

const styles = {
  actions: css`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    gap: var(--spectrum-global-dimension-size-100);
    border-top: 1px solid #ccc;
    padding: 16px 0 0 0;
    grid-area: buttons;
  `,
}

export function PromptPropertiesPanel(props) {
  const currentSession = useRecoilValue(currentSessionState);

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
        <Flex direction={'column'} UNSAFE_style={{ position: 'relative', height: '100%' }}>
          <InputsView/>
        </Flex>
      </Flex>

      <div className={styles.actions}>
        <ResetButton/>
        <GenerateButton/>
      </div>

    </Grid>
  )
}
