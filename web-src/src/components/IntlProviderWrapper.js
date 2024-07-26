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
import React from 'react';
import { IntlProvider } from 'react-intl';

/* eslint-disable import/extensions */
import * as messagesApp from './__localization__/App.l10n';
import * as messagesMainSidePanel from './__localization__/MainSidePanel.l10n';
import * as messagesPromptResultCard from './__localization__/PromptResultCard.l10n';
import * as messagesPromptSessionSideView from './__localization__/PromptSessionSideView.l10n';
import * as messagesFavorites from './__localization__/Favorites.l10n';
import * as messagesImageViewer from './__localization__/ImageViewer.l10n';
import * as messagesContentFragmentExportButton from './__localization__/ContentFragmentExportButton.l10n';
import { useShellContext } from './ShellProvider';
/* eslint-enable import/extensions */

function getAllMessages(locale) {
  if (typeof locale !== 'string') {
    return {};
  }

  const normalizedLocale = locale.replace(/-/g, '_');
  return {
    ...messagesApp[normalizedLocale],
    ...messagesMainSidePanel[normalizedLocale],
    ...messagesPromptResultCard[normalizedLocale],
    ...messagesPromptSessionSideView[normalizedLocale],
    ...messagesFavorites[normalizedLocale],
    ...messagesImageViewer[normalizedLocale],
    ...messagesContentFragmentExportButton[normalizedLocale],
  };
}

export function IntlProviderWrapper({ children }) {
  const { user } = useShellContext();

  return (
    <IntlProvider
      messages={getAllMessages(user.locale)}
      locale={user.locale}
      defaultLocale='en-US'
    >
      {children}
    </IntlProvider>
  );
}
