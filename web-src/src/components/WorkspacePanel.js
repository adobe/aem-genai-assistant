import {Flex, Grid} from '@adobe/react-spectrum';
import {FormPanel} from './FormPanel.js';
import {ResultsView} from './ResultsView.js';
import Editor from './Editor.js';
import React from 'react';

export function WorkspacePanel() {
  return (
    <Grid
      columns={['250px', 'auto']}
      rows={['auto']}
      gap={'size-300'}
      UNSAFE_style={{ background: 'white', padding: '30px', margin: '0 20px 0 20px', borderRadius: '20px 20px 0 0', border: '2px #e0e0e0 solid' }}>
      <FormPanel />
      <Flex direction={'column'} gap={'size-400'} alignItems={'stretch'} justifyContent={'stretch'}>
        <ResultsView flexGrow={1}/>
        <Editor flexGrow={0} flaxBasis={'200px'} height={'200px'} />
      </Flex>
    </Grid>
  )
}

