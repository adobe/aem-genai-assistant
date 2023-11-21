import { createVariants } from './CreateVariants.js';

const uuid = () => 123;

describe('createVariants', () => {
  test('response is a JSON string: an array of json objects', () => {
    const response = [
      {key1: 'value1', key2: 'value2'},
      {key3: 'value3', key4: 'value4'},
      null,
      'Hello!',
      '<tag>how</tag> is it going?'
    ];
    expect(createVariants(uuid, JSON.stringify(response))).toEqual([
      { id: 123, content: {key1: 'value1', key2: 'value2'} },
      { id: 123, content: {key3: 'value3', key4: 'value4'} },
      { id: 123, content: 'null' },
      { id: 123, content: 'Hello!' },
      { id: 123, content: 'how is it going?' }
    ]);
  });
  test('response is a JSON string: an object', () => {
    const response = {key: 'value'};
    expect(createVariants(uuid, JSON.stringify(response))).toEqual([
      { id: 123, content: {key: 'value'} },
    ]);
  });
  test('response is a string', () => {
    const response = 'Hello! How can I assist you today?';
    expect(createVariants(uuid, response)).toEqual([{ id: 123, content: response }]);
  });
});