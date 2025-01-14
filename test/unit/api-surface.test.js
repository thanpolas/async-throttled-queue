/**
 * @fileoverview Test API surface of the library.
 */

const atq = require('../..');

describe('API Surface', () => {
  test('Should export a function', () => {
    console.log(atq);
    expect(atq).toBeFunction();
  });
  test('Should export a dispose() function', () => {
    expect(atq.dispose).toBeFunction();
  });
});
