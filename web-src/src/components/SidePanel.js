import {Flex, Grid, Image, Link, Text} from '@adobe/react-spectrum';
import {PromptTemplatePicker} from './PromptTemplatePicker.js';
import React from 'react';
import {useApplicationContext} from './ApplicationProvider.js';

import LogoIcon from '../assets/logo.svg';
import HelpIcon from '../assets/help.svg';
import {useRecoilState} from 'recoil';
import {NEW_SESSION, viewState, WORKSPACE} from '../state/ViewState.js';

export function SidePanel(props) {
  const { appVersion } = useApplicationContext();
  const [view, setView] = useRecoilState(viewState);
  return (
    <Grid {...props}
      areas={['header', 'picker', 'menu', 'footer']}
      columns={['auto']}
      rows={['min-content', 'min-content', 'auto', 'min-content']}
      gap={'size-100'}>
      <Flex direction={'row'} justifyContent={'space-between'} alignItems={'center'} gridArea={'header'}>
        <Image src={LogoIcon} alt={'logo'}/>
        <Text>AEM GenAI Assistant</Text>
        <Text justifySelf={'end'}>v{appVersion}</Text>
      </Flex>
      <PromptTemplatePicker />
      <Flex direction={'column'} gridArea={'menu'} gap={'size-100'}>
        <Link onPress={() => setView(NEW_SESSION)}>Prompts</Link>
        <Link>Favorites</Link>
        <Link onPress={() => setView(WORKSPACE)}>Recent</Link>
      </Flex>
      <Flex direction={'column'} gridArea={'footer'}>
        <Flex direction={'row'} justifyContent={'start'} alignItems={'center'} gap={'size-100'}>
          <Image src={HelpIcon} width={'20px'}/><Link>Help</Link>
        </Flex>
        <Text>Copyright © 2023 Adobe. All rights reserved</Text>
      </Flex>
    </Grid>
  )
}
