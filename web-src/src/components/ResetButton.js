import {ActionButton, Button, Image, Text} from '@adobe/react-spectrum';
import {useSetRecoilState} from 'recoil';

import ResetIcon from '../assets/reset.svg';
import {parametersState} from '../state/ParametersState.js';

export function ResetButton(props) {
  const setParameters = useSetRecoilState(parametersState);

  const handleReset = () => {
    setParameters([]);
  };

  return (
    <Button
      {...props}
      onPress={handleReset}
      variant={'secondary'}>
      <Image src={ResetIcon}/>
      <Text>Reset</Text>
    </Button>
  );
}
