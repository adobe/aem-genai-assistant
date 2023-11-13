import {Image} from '@adobe/react-spectrum';

import NewSessionBanner from '../assets/new-session-banner.png';

export function NewSessionPanel() {
  return (
    <div>
      <Image src={NewSessionBanner} width={'50%'}/>
      <h1>Welcome to the AEM GenAI Assistant!</h1>
      <p>Create high quality content quickly then measure it with experimentation or publish it to your site.</p>
    </div>
  );
}

