import React, { useEffect, useState } from 'react';
import { Content, Grid, Heading, IllustratedMessage, View } from '@adobe/react-spectrum';
import WriteIcon from '../icons/WriteIcon';
import Editor from './Editor';

function ContainerView() {

  return (
    <Grid
      areas={[
        'prompt variations',
      ]}
      columns={['1fr', '1fr']}
      rows={['auto']}
      height="100vh"
      >
      <View gridArea="prompt" overflow="auto" height="90vh" UNSAFE_style={{"paddingRight": "30px"}}>
        <Editor />
      </View>
      <View gridArea="variations" height="90vh" UNSAFE_style={{"paddingLeft": "30px", "border": "2px solid lightgray", "borderRadius": "10px"}}>
        <IllustratedMessage>
          <WriteIcon />
          <Heading>Nothing here yet</Heading>
          <Content>Type in a prompt to generate content</Content>
        </IllustratedMessage>
      </View>
    </Grid>
  )
};

export default ContainerView;
