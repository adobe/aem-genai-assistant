import {Flex, Grid} from '@adobe/react-spectrum';
import {PromptPropertiesPanel} from './PromptPropertiesPanel.js';
import {ResultsView} from './ResultsView.js';
import PromptEditor from './PromptEditor.js';
import React from 'react';

const arr = [];
for (let i=0; i<100; i++) {
  const div = document.createElement('div');
  div.innerText = 'hello world';
  arr.push(div);
}

export function CurrentSessionPanel() {
  return (
    <Grid
      columns={['250px', '1fr']}
      rows={['100%']}
      justifyContent={'stretch'}
      alignItems={'stretch'}
      gap={'size-300'}
      width={'100%'}
      height={'100%'}
      UNSAFE_style={{ background: 'white', padding: '30px', margin: '0 20px 0 20px', borderRadius: '20px 20px 0 0', border: '2px #e0e0e0 solid' }}>
      <PromptPropertiesPanel />
      <Grid columns={'1fr'} rows={['1fr', 'min-content']} alignItems={'center'} justifyContent={'center'} gap={25}>
        <Flex direction={'column'} UNSAFE_style={{overflow: 'auto', position: 'relative', width: '100%', height: '100%'}}>
          <ResultsView />
        </Flex>
        <PromptEditor flexGrow={0} />
      </Grid>
    </Grid>
  )
}
