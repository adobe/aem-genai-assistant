// write test for CreateVariations function

import { createVariants } from './CreateVariants.js';

function objectToString(obj) {
  return String(obj).replace(/<\/?[^>]+(>|$)/g, '');
}

function jsonToString(json) {
  if (json === null || typeof json !== 'object') {
    return objectToString(json);
  }
}

function createVariants(response) {
  try {
    const json = JSON.parse(response);
    if (Array.isArray(json)) {
      return json.map((item) => ({ id: uuid(), content: jsonToString(item) }));
    } else {
      return [{ id: uuid(), content: String(response) }];
    }
  } catch (error) {
    return [{ id: uuid(), content: String(response) }];
  }
}


describe('createVariants', () => {
    test('variants is an array of json objects', () => {
      const variants = [{key1: 'value1'}, {key2: 'value2'}];
      expect(createVariants(123, variants)).toEqual({ id: 123, content: variants });
    });
  });