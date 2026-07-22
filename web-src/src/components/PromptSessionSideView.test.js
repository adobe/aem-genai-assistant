/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { useRecoilValue, useRecoilState } from 'recoil';

import { PromptSessionSideView } from './PromptSessionSideView.js';
import { intlMessages } from './PromptSessionSideView.l10n.js';

// Recoil is mocked so the panel can render without a <RecoilRoot>; the atoms are
// only used as opaque keys, so returning fixed values here is sufficient.
jest.mock('recoil', () => ({
  atom: jest.fn(),
  useRecoilValue: jest.fn(),
  useRecoilState: jest.fn(),
}));

// The compliance notice is the unit under test; the surrounding form/action
// children are stubbed so the test doesn't depend on their internals.
jest.mock('./PromptInputView.js', () => ({ PromptInputView: () => null }));
jest.mock('./GenerateButton.js', () => ({ GenerateButton: () => null }));
jest.mock('./SavePromptButton.js', () => ({ SavePromptButton: () => null }));
jest.mock('./ResetButton.js', () => ({ ResetButton: () => null }));
jest.mock('./ShellProvider.js', () => ({
  useShellContext: () => ({ user: { locale: 'en-US' } }),
}));

describe('PromptSessionSideView', () => {
  beforeEach(() => {
    useRecoilValue.mockReturnValue({ name: 'Test Prompt', description: 'A description' });
    useRecoilState.mockReturnValue([undefined, jest.fn()]);
  });

  // Guards the CAI/compliance requirement (SITES-46697): the AI-generated-content
  // notice must always be present in the prompt panel.
  it('renders the AI compliance notice', () => {
    render(
      <IntlProvider locale="en-US" defaultLocale="en-US">
        <PromptSessionSideView />
      </IntlProvider>,
    );

    expect(
      screen.getByText(intlMessages.promptSessionSideView.complianceText.defaultMessage),
    ).toBeInTheDocument();
  });
});
