import {Flex, Grid, Image, Link, Text} from '@adobe/react-spectrum';
import React from 'react';
import {useApplicationContext} from './ApplicationProvider.js';

import LogoIcon from '../assets/logo.svg';
import HelpIcon from '../assets/help.svg';
import {useRecoilState, useRecoilValue} from 'recoil';
import {sessionsState} from '../state/SessionsState.js';
import {currentSessionState} from '../state/CurrentSessionState.js';

export function SidePanel(props) {
  const { appVersion } = useApplicationContext();
  const sessions = useRecoilValue(sessionsState);
  const [currentSession, setCurrentSession] = useRecoilState(currentSessionState);

  return (
    <Grid {...props}
      UNSAFE_style={{ padding: '10px' }}
      areas={['header', 'menu', 'footer']}
      columns={['auto']}
      rows={['min-content', '1fr', 'min-content']}
      gap={'size-400'}>
      <Flex direction={'row'} justifyContent={'space-between'} alignItems={'center'} gridArea={'header'}>
        <Image src={LogoIcon} alt={'logo'}/>
        <Text>AEM GenAI Assistant</Text>
        <Text justifySelf={'end'}>v{appVersion}</Text>
      </Flex>

      <Flex direction={'column'} gridArea={'menu'} gap={'size-100'}>
        <ul>
          <li><Link onPress={() => setCurrentSession(null)}>Prompts</Link></li>
          <li><Link>Favorites</Link></li>
          <li>
            <Text>Recent</Text>
            <ul>
              { (sessions && sessions.length > 0) && sessions.map((session) => (
                <li key={session.id}>
                  <Link onPress={() => setCurrentSession(session)}>{session.name}</Link>
                </li>
              )) }
            </ul>
          </li>
        </ul>
      </Flex>

      <Flex direction={'column'} gridArea={'footer'} gap={10}>
        <Flex direction={'row'} justifyContent={'start'} alignItems={'center'} gap={'size-100'}>
          <Image src={HelpIcon} width={'20px'}/><Link>Help</Link>
        </Flex>
        <Flex direction={'row'} justifyContent={'start'} alignItems={'center'} gap={'size-100'}>
          <Image src={HelpIcon} width={'20px'}/><Link>Terms and legals</Link>
        </Flex>
        <Text UNSAFE_style={{ fontSize: '10px' }}>Copyright © 2023 Adobe. All rights reserved</Text>
      </Flex>
    </Grid>
  )
}
