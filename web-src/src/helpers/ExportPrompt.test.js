import { toClipboard, toHTML } from './ExportPrompt.js';

describe('toHTML', () => {
  test('returns html: prompt result is an key/value pair', () => {
    const promptResponse = {key1: 'value1', key2: 'value2'};
    expect(toHTML(promptResponse)).toEqual('<b>key1</b>: value1<br/><b>key2</b>: value2');
  });
  test('returns html: prompt result is a string', () => {
    const promptResponse = 'hello';
    expect(toHTML(promptResponse)).toEqual('hello');
  });
});

