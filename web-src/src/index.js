/*
* <license header>
*/

import ReactDOM from 'react-dom'

import App from './components/App'
import {defaultTheme, Provider} from '@adobe/react-spectrum';
import './index.css'

ReactDOM.render(
  <Provider theme={defaultTheme} height='100%'>
    <App />
  </Provider>,
  document.getElementById('root')
)
