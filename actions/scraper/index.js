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
const Papa = require('papaparse');
const { JSDOM } = require('jsdom');
const wretch = require('../Network.js');
const { asGenericAction } = require('../GenericAction.js');
const { asAuthAction } = require('../AuthAction.js');
const { asFirefallAction } = require('../FirefallAction.js');

async function main({
  url, selector, prompt, firefallClient,
}) {
  const html = await wretch(url).get().text();
  const dom = new JSDOM(html);
  console.log(`Selector: ${selector}`);
  const text = Array.from(dom.window.document.querySelectorAll(selector))
    .map((node) => node.textContent.replace(/\s+/g, ' '))
    .join('\n');
  console.log(`Text: ${text}`);
  const { generations } = await firefallClient.completion(`${prompt}:\n\n${text}`, 0);
  return generations[0][0].message.content;
}

exports.main = asGenericAction(asAuthAction(asFirefallAction(main)));
