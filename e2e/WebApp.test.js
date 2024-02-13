/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import * as React from 'react';
import {
  act, render, screen, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { RecoilRoot } from 'recoil';
import { defaultTheme, Provider } from '@adobe/react-spectrum';
import { ApplicationProvider } from '../web-src/src/components/ApplicationProvider.js';
import { App } from '../web-src/src/components/App.js';
import { CONSENT_KEY } from '../web-src/src/components/ConsentDialog.js';

const CONFIG_URL = 'https://localhost:9080/index.html?ref=ref&repo=repo&owner=owner';

const mockConsentKey = CONSENT_KEY;

jest.mock('@adobe/exc-app/settings', () => ({
  get: jest.fn().mockImplementation(() => Promise.resolve({
    settings: {
      [mockConsentKey]: true,
    },
  })),
  SettingsLevel: jest.fn(),
}));

jest.mock('../web-src/src/helpers/NetworkHelper.js', () => ({
  wretchRetry: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockImplementation(() => ({
      json: jest.fn().mockRejectedValue(new Error('error')),
    })),
  })),
}));

jest.mock('../web-src/src/components/ShellProvider.js', () => ({
  useShellContext: jest.fn().mockReturnValue({
    user: {
      imsOrg: 'org',
      imsToken: 'token',
    },
    done: jest.fn(),
  }),
}));

jest.mock('../web-src/src/services/FirefallService.js', () => ({
  // eslint-disable-next-line func-names
  FirefallService: jest.fn().mockImplementation(function () {
    this.complete = jest.fn().mockReturnValue('text');
    this.fallback = jest.fn().mockReturnValue({});
  }),
}));

describe('WebApp', () => {
  beforeEach(() => {
    delete window.location;
    window.location = new URL(CONFIG_URL);
  });

  it.skip('renders correctly', async () => {
    await act(async () => render(
      <RecoilRoot>
        <ApplicationProvider>
          <Provider colorScheme="light" theme={defaultTheme} width="100%" height="100%">
            <App />
          </Provider>
        </ApplicationProvider>
      </RecoilRoot>,
    ));

    expect(screen.getByTestId('prompt-templates-view')).toBeInTheDocument();

    await waitFor(() => expect(screen.getAllByTestId('prompt-template-card').length).toBeGreaterThan(1));
  });
});
