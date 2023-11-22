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
import { parseExpression } from './ExpressionParser.js';

describe('parser', () => {
  test('parses expressions', () => {
    expect(parseExpression('{{test}}')).toEqual({ modifier: null, identifier: 'test', parameters: [] });
    expect(parseExpression('{{ test }}')).toEqual({ modifier: null, identifier: 'test', parameters: [] });
    expect(parseExpression('{{@test}}')).toEqual({ modifier: '@', identifier: 'test', parameters: [] });
    expect(parseExpression('{{@ test }}')).toEqual({ modifier: '@', identifier: 'test', parameters: [] });
    expect(parseExpression('{{#test}}')).toEqual({ modifier: '#', identifier: 'test', parameters: [] });
    expect(parseExpression('{{# test }}')).toEqual({ modifier: '#', identifier: 'test', parameters: [] });
    expect(parseExpression('{{test, p1 = v1 }}')).toEqual({ modifier: null, identifier: 'test', parameters: [{ key: 'p1', value: 'v1' }] });
    expect(parseExpression('{{@ test, p1 = v1, p2 = "hello world" }}')).toEqual({ modifier: '@', identifier: 'test', parameters: [{ key: 'p1', value: 'v1' }, { key: 'p2', value: 'hello world' }] });
  });
});
