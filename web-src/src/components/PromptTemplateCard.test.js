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

import { isParentNode, isSystemTemplate } from './PromptTemplateCard.js';
import { NEW_PROMPT_TEMPLATE_ID } from '../state/PromptTemplatesState.js';
import { getLocalizedTemplateInfo } from './PromptTemplateCard.l10n.js';

describe('isSystemTemplate', () => {
  test('should return true for bundled templates', () => {
    const template = { isBundled: true, id: 'any_id' };
    expect(isSystemTemplate(template)).toBe(true);
  });

  test('should return true for the new prompt template', () => {
    const template = { isBundled: false, id: NEW_PROMPT_TEMPLATE_ID };
    expect(isSystemTemplate(template)).toBe(true);
  });

  test('should return false for non-bundled templates', () => {
    const template = { isBundled: false, id: 'some_random_id' };
    expect(isSystemTemplate(template)).toBe(false);
  });
});

describe('isParentNode', () => {
  test('should return true if the child is the same as the parent', () => {
    document.body.innerHTML = '<div id="parent"></div>';
    const parent = document.getElementById('parent');

    expect(isParentNode(parent, parent)).toBe(true);
  });

  test('should return true if the second node is a parent of the first', () => {
    document.body.innerHTML = '<div id="parent"><div id="child"></div></div>';
    const parent = document.getElementById('parent');
    const child = document.getElementById('child');

    expect(isParentNode(child, parent)).toBe(true);
  });

  test('should return false if the second node is not a parent of the first', () => {
    document.body.innerHTML = '<div id="parent"></div><div id="child"></div>';
    const parent = document.getElementById('parent');
    const child = document.getElementById('child');

    expect(isParentNode(child, parent)).toBe(false);
  });

  test('should return false if the parent is null', () => {
    document.body.innerHTML = '<div id="child"></div>';
    const child = document.getElementById('child');

    expect(isParentNode(child, null)).toBe(false);
  });

  test('should handle deeply nested structures', () => {
    document.body.innerHTML = '<div id="grandparent"><div id="parent"><div id="child"></div></div></div>';
    const grandparent = document.getElementById('grandparent');
    const child = document.getElementById('child');

    expect(isParentNode(child, grandparent)).toBe(true);
  });
});

describe('getLocalizedTemplateInfo', () => {
  test('calls formatMessage for a known key and returns localized label and description', () => {
    const mockFormatMessage = jest.fn((descriptor) => `[${descriptor.id}]`);
    const result = getLocalizedTemplateInfo('cards', 'Cards', 'Raw description', mockFormatMessage);
    expect(mockFormatMessage).toHaveBeenCalledWith(expect.objectContaining({ id: 'promptTemplateCard.cards.label' }));
    expect(mockFormatMessage).toHaveBeenCalledWith(expect.objectContaining({ id: 'promptTemplateCard.cards.description' }));
    expect(result.label).toBe('[promptTemplateCard.cards.label]');
    expect(result.description).toBe('[promptTemplateCard.cards.description]');
  });

  test('falls back to raw label and description for an unknown key', () => {
    const mockFormatMessage = jest.fn();
    const result = getLocalizedTemplateInfo(null, 'Custom Label', 'Custom description', mockFormatMessage);
    expect(mockFormatMessage).not.toHaveBeenCalled();
    expect(result.label).toBe('Custom Label');
    expect(result.description).toBe('Custom description');
  });

  test('covers newPrompt key used by the new-prompt template', () => {
    const mockFormatMessage = jest.fn((descriptor) => `[${descriptor.id}]`);
    const result = getLocalizedTemplateInfo('newPrompt', 'New prompt', 'Raw desc', mockFormatMessage);
    expect(result.label).toBe('[promptTemplateCard.newPrompt.label]');
  });
});
