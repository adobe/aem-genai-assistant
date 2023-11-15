import {Button, Text} from '@adobe/react-spectrum';
import {v4 as uuid} from 'uuid';

import GenAIIcon from '../icons/GenAIIcon.js';
import {useSetRecoilState} from 'recoil';
import {sessionsState} from '../state/SessionsState.js';
import {currentSessionState} from '../state/CurrentSessionState.js';
import {useCallback} from 'react';
import {ViewType, viewTypeState} from '../state/ViewType.js';

export function NewButton(props) {
  const setCurrentSession = useSetRecoilState(currentSessionState);
  const setViewType = useSetRecoilState(viewTypeState);

  const handleNewPrompt = useCallback(() => {
    const session = {
      id: uuid(),
      name: `Session ${Date.now()}`,
      description: `Session ${Date.now()}`,
      timestamp: Date.now(),
      prompt: '',
      results: [],
    };
    setCurrentSession(session);
    setViewType(ViewType.CurrentSession);
  }, [setCurrentSession]);

  return (
    <Button
      {...props}
      onPress={handleNewPrompt}
      position={'absolute'}
      variant={'secondary'}>
      <GenAIIcon color="#909090" />
      <Text>New</Text>
    </Button>
  );
}
