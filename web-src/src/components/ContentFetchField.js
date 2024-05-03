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
import { ProgressBar, TextField } from '@adobe/react-spectrum';
import React, { useCallback, useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { useApplicationContext } from './ApplicationProvider.js';

function isValidUrl(url) {
  try {
    return Boolean(new URL(url));
  } catch (e) {
    return false;
  }
}

export function ContentFetchField({
  onChange, prompt, selector, ...props
}) {
  const [url, setUrl] = useState('');
  const [isPending, setIsPending] = useState(false);
  const { contentScrapingService } = useApplicationContext();

  const debouncedFetchContent = useCallback(
    debounce((fetchFromUrl) => {
      setIsPending(true);
      contentScrapingService.getContent(fetchFromUrl, selector, prompt)
        .then(async (text) => {
          console.debug(`Scraped content: ${text}`);
          onChange(text);
          setIsPending(false);
        })
        .catch((e) => {
          console.error(e);
          onChange('');
          setIsPending(false);
        });
    }, 1000),
    [prompt],
  );

  useEffect(() => {
    if (!isValidUrl(url)) {
      console.log(`Invalid URL: ${url}`);
      onChange('');
      return;
    }
    debouncedFetchContent(url);
  }, [url]);

  return (
      <>
        <TextField
          value={url}
          width="100%"
          validationState={isValidUrl(url) ? 'valid' : 'invalid'}
          isRequired
          onChange={setUrl}
          {...props}
        />
        { isPending && <ProgressBar label={'Fetching content...'} isIndeterminate /> }
      </>
  );
}
