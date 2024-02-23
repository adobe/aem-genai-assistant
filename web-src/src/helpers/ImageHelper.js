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

export async function generateImagePrompt(firefallService, selectedVariant) {
  const variantToImagePrompt = `I want to create images using a text-to-image model. For this, I need a concise, one-sentence image prompt created by following these steps:
    - Read and understand the subject or theme from the given JSON context below.
    - Specify key elements such as individuals, actions, and emotions within this context, ensuring they align with the theme.
    - Formulate a single-sentence prompt which includes these elements, and also focusing on realism and the activity.
    - The prompt should be clear and direct, highlighting the main components as concrete as possible: a subject (e.g., a concrete object related to the topic or a person), \
    action (e.g., using headphones, knowledge transfer), and the emotional tone(e.g. happy, persuasive, serious, etc.).
    - An example to the generated image prompt from a given context:
    Context: {
      "Title": "Discover Perfect Sound",
      "Body": "Explore our bestselling wireless headphones."
    }
    Generated Prompt:
    "A happy, confident person enjoying music in an urban park, using high-quality wireless headphones, with the city skyline in the background."
    Here is the JSON context: ${JSON.stringify(selectedVariant.content)}`;
  const { queryId, response } = await firefallService.complete(variantToImagePrompt, 0);
  return response;
}

function base64ToBlob(base64, contentType) {
  const binary = atob(base64.split(',')[1]);
  const array = [];
  for (let i = 0; i < binary.length; i += 1) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: contentType });
}

export async function copyTextImageToClipboard(text, image, contentType) {
  const blob = base64ToBlob(image, contentType);
  await navigator.clipboard.write([
    new ClipboardItem({
      'text/plain': new Blob([text], { type: 'text/plain' }),
      [blob.type]: blob,
    }),
  ]);
}

export async function copyImageToClipboard(image, contentType) {
  const blob = base64ToBlob(image, contentType);
  await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob,
    }),
  ]);
}

export async function copyImagesToClipboard(images, contentType) {
  const clipboardItems = [];
  for (const image of images) {
    const blob = base64ToBlob(image, contentType);
    clipboardItems.push(new ClipboardItem({ [blob.type]: blob }));
  }
  await navigator.clipboard.write(clipboardItems);
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
