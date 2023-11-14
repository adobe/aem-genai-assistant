import {Flex, Grid, Heading, Image, Item, Text, View, Well} from '@adobe/react-spectrum';

import NewSessionBanner from '../assets/new-session-banner.png';
import React, {useCallback, useEffect} from 'react';
import {useApplicationContext} from './ApplicationProvider.js';
import {useRecoilState, useSetRecoilState} from 'recoil';
import {promptTemplatesState} from '../state/PromptTemplatesState.js';
import {promptTemplateState} from '../state/PromptTemplateState.js';
import {parseSpreadSheet} from '../helpers/SpreadsheetParser.js';
import {PromptTemplateCard} from './PromptTemplateCard.js';
import {viewState, WORKSPACE} from '../state/ViewState.js';

const PROMPT_TEMPLATES_FILENAME = 'prompttemplates.json';

export function PromptTemplatesPanel({props}) {
  const { websiteUrl } = useApplicationContext();
  const [promptTemplates, setPromptTemplates] = useRecoilState(promptTemplatesState);
  const setPrompt = useSetRecoilState(promptTemplateState);
  const setView = useSetRecoilState(viewState);

  useEffect(() => {
    parseSpreadSheet(`${websiteUrl}/${PROMPT_TEMPLATES_FILENAME}`).then(setPromptTemplates);
  }, [websiteUrl, setPromptTemplates]);

  const promptSelectionHandler = useCallback((selected) => {
    setPrompt(promptTemplates[selected]);
    setView(WORKSPACE);
  }, [promptTemplates, setPrompt]);

  return (
    <Grid
      {...props}
      columns={['1fr']}
      rows={['min-content', 'min-content', '1fr']}
      UNSAFE_style={{ background: 'white', padding: '50px', margin: '0 20px 0 20px', borderRadius: '20px 20px 0 0', border: '2px #e0e0e0 solid' }}>
      <Flex direction={'column'}
            width={'70%'}
            gap={0}
            height={'300px'}
            marginTop={20}
            marginBottom={20}>
        <Image
          src={NewSessionBanner}
          objectFit={'cover'}
          marginBottom={20}
          UNSAFE_style={{ borderRadius: '20px' }}
        />
        <h3 style={{ padding: 0, margin: 0 }}>Welcome to the AEM GenAI Assistant!</h3>
        <p>Create high quality content quickly then measure it with experimentation or publish it to your site.</p>
      </Flex>
      <Heading level={4} alignSelf={'start'}>Prompts</Heading>
      <View
        overflow={'auto'}>
        <Grid
          width={'100%'}
          alignItems={'center'}
          columns={'repeat(auto-fill, minmax(250px, 1fr))'} gap={'size-200'}>
          {
            promptTemplates &&
              promptTemplates
                .map((template, index) => (
                  <PromptTemplateCard
                    key={index}
                    template={template}
                    onClick={() => promptSelectionHandler(index)} />
                ))
          }
        </Grid>
      </View>
    </Grid>
  );
}
