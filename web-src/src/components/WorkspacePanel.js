import {Flex, Grid} from '@adobe/react-spectrum';
import {FormPanel} from './FormPanel.js';
import {ResultsView} from './ResultsView.js';
import Editor from './Editor.js';
import React from 'react';

export function WorkspacePanel() {
  return (
    <Grid
      columns={['250px', '1fr']}
      rows={['100%']}
      justifyContent={'stretch'}
      alignItems={'stretch'}
      gap={'size-300'}
      height={'100%'}
      UNSAFE_style={{ background: 'white', padding: '30px', margin: '0 20px 0 20px', borderRadius: '20px 20px 0 0', border: '2px #e0e0e0 solid' }}>
      <FormPanel />
      <Grid columns={'1fr'} rows={['1fr', 'min-content']} alignItems={'center'} justifyContent={'center'}>
        <ResultsView flexGrow={1}/>
        <Editor flexGrow={0} flaxBasis={'200px'} height={'150px'} />
      </Grid>
    </Grid>
  )
}

