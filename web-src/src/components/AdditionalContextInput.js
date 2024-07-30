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
import {
  ActionButton, ProgressCircle, TextArea, TextField,
} from '@adobe/react-spectrum';
import React, { useCallback, useState } from 'react';
import { css } from '@emotion/css';
import { ToastQueue } from '@react-spectrum/toast';
import { useIntl } from 'react-intl';
import { useApplicationContext } from './ApplicationProvider.js';
import { DescriptionLabel } from './DescriptionLabel.js';

import { intlMessages } from './AdditionalContextInput.l10n.js';

const DEFAULT_PROMPT = 'Summarize the key points from the following source document to guide the creation of the content';
const DEFAULT_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, li, td, th, span, blockquote, article, section, header, footer, aside, nav, div, a, strong, em, code, pre, figure, figcaption';

function isValidUrl(url) {
  try {
    return Boolean(new URL(url));
  } catch (e) {
    return false;
  }
}

const styles = {
  scraper: css`
    display: grid;
    grid-template-columns: 1fr auto;
    width: 100%;
    align-items: end;
  `,
  scraperInput: css`
    grid-column: 1;
    width: 100%;
  `,
  scraperButton: css`
    grid-column: 2;
    margin-left: 10px;
    width: var(--spectrum-global-dimension-size-1000);
  `,
};

function ContentScraper({ selector, prompt, onChange }) {
  const { contentScrapingService } = useApplicationContext();
  const [url, setUrl] = useState('');
  const [isPending, setIsPending] = useState(false);

  const { formatMessage } = useIntl();

  const fetchContent = useCallback((fetchFromUrl) => {
    if (!isValidUrl(fetchFromUrl)) {
      console.error(`Invalid URL: ${fetchFromUrl}`);
      return;
    }
    setIsPending(true);
    contentScrapingService.getContent(fetchFromUrl, selector ?? DEFAULT_SELECTOR, prompt ?? DEFAULT_PROMPT)
      .then(async (text) => {
        console.debug(`Scraped content: ${text}`);
        onChange(text);
        ToastQueue.positive(formatMessage(intlMessages.contentFetchedSuccessfullyToastMessage), { timeout: 1000 });
        setIsPending(false);
      })
      .catch((e) => {
        console.error(e);
        onChange('');
        ToastQueue.negative(
          formatMessage(intlMessages.contentFetchFailedToastMessage, { url: fetchFromUrl }),
          { timeout: 1000 },
        );
        setIsPending(false);
      });
  }, [selector, prompt, onChange, contentScrapingService]);

  return (
    <div className={styles.scraper}>
      <TextField
        value={url}
        isDisabled={isPending}
        onChange={setUrl}
        label={formatMessage(intlMessages.domainKnowledgeUrlLabel)}
        contextualHelp={<DescriptionLabel
          label={formatMessage(intlMessages.domainKnowledgeUrlContextualHelpTitle)}
          description={formatMessage(intlMessages.domainKnowledgeUrlContextualHelpDescription)} />}
        UNSAFE_className={styles.scraperInput}
      />
      <ActionButton
        isDisabled={!isValidUrl(url) || isPending}
        onPress={() => fetchContent(url)}
        UNSAFE_className={styles.scraperButton}>
        {isPending ? <ProgressCircle size={'S'} isIndeterminate /> : formatMessage(intlMessages.fetchButtonLabel)}
      </ActionButton>
    </div>
  );
}

export function AdditionalContextInput({
  label, description, prompt, selector, value, onChange,
}) {
  return (
    <>
      <ContentScraper selector={selector} prompt={prompt} onChange={onChange} />
      <TextArea
        value={value}
        label={label}
        width={'100%'}
        contextualHelp={<DescriptionLabel label={label} description={description} />}
        onChange={onChange}
      />
    </>
  );
}
