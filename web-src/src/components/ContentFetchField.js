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
import { TextField } from '@adobe/react-spectrum';
import React, { useCallback, useEffect, useState } from 'react';
import { debounce } from 'lodash';
import wretch from 'wretch';
import { useApplicationContext } from './ApplicationProvider.js';

const domParser = new DOMParser();

function isValidUrl(url) {
  try {
    return Boolean(new URL(url));
  } catch (e) {
    return false;
  }
}

const fetchContent = async function (url) {
  const html = await wretch(url).get().text();
  const text = Array.from(domParser.parseFromString(html, 'text/html').querySelectorAll('div')).map((node) => {
    return node.textContent.replace(/\s+/g, ' ');
  }).join('\n');
  console.log(`Text: ${text}`);
  return text;
};

export function ContentFetchField({ onChange, prompt, ...props }) {
  const [url, setUrl] = useState('');
  const [pending, setPending] = useState(false);
  const { firefallService } = useApplicationContext();

  const debouncedFetchContent = useCallback(debounce((fetchFromUrl) => {
    setPending(true);
    fetchContent(fetchFromUrl)
      .then(async (text) => {
        console.debug(`Fetched content: ${text}`);
        if (prompt) {
          const { response: processedText } = await firefallService.complete(`${prompt}:\n\n${text}`, 0);
          console.debug(`Processed content: ${processedText}`);
          onChange(processedText);
        } else {
          onChange(text);
        }
        setPending(false);
      })
      .catch((e) => {
        console.error(e);
        onChange('');
        setPending(false);
      });
  }, 1000));

  useEffect(() => {
    if (!isValidUrl(url)) {
      console.log(`Invalid URL: ${url}`);
      onChange('');
      return;
    }
    debouncedFetchContent(url);
  }, [url]);

  return (
    <TextField
      value={url}
      width="100%"
      validationState={isValidUrl(url) ? 'valid' : 'invalid'}
      isRequired
      isDisabled={pending}
      onChange={setUrl}
      {...props}
    />
  );
}
