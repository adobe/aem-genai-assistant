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
export function toText(input) {
  if (typeof input === 'string') {
    return input;
  } else {
    return Object.entries(input).map(([key, value]) => {
      return `${key}: ${value}`;
    }).join('\n');
  }
}

export function toHTML(input) {
  if (typeof input === 'string') {
    return input;
  } else {
    return Object.entries(input).map(([key, value]) => {
      return `<b>${key}</b>: ${value}`;
    }).join('<br/>');
  }
}

export function base64ToBlob(base64, contentType) {
  const binary = atob(base64.split(',')[1]);
  const array = [];
  for (let i = 0; i < binary.length; i += 1) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: contentType });
}

export async function copyImageToClipboard(base64, contentType) {
  const blob = base64ToBlob(base64, contentType);
  await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob,
    }),
  ]);
}

export async function copyImagesToClipboard(images) {
  const clipboardItems = [];
  for (const image of images) {
    const blob = base64ToBlob(image, 'image/png');
    clipboardItems.push(new ClipboardItem({ [blob.type]: blob }));
  }
  await navigator.clipboard.write(clipboardItems);
}

export async function copyTextImageToClipboard(text, base64, contentType) {
  const blob = base64ToBlob(base64, contentType);
  await navigator.clipboard.write([
    new ClipboardItem({
      'text/plain': new Blob([text], { type: 'text/plain' }),
      [blob.type]: blob,
    }),
  ]);
}

export async function copyTextToClipboard(text) {
  await navigator.clipboard.write([
    new ClipboardItem({ 'text/plain': new Blob([text], { type: 'text/plain' }) }),
  ]);
}

export function copyImageToClipboardLegacy(base64ImageData) {
  // Create an image element and set its source to the data URL
  const imageVariant = document.createElement('img');
  imageVariant.src = base64ImageData;

  // Create a contenteditable div
  const contentEditableDiv = document.createElement('div');
  contentEditableDiv.contentEditable = true;
  contentEditableDiv.appendChild(imageVariant);

  // Append the contenteditable div to the document
  document.body.appendChild(contentEditableDiv);

  // Select and copy the content
  const range = document.createRange();
  range.selectNode(contentEditableDiv);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  document.execCommand('copy');

  // Remove the contenteditable div from the DOM
  document.body.removeChild(contentEditableDiv);
}
