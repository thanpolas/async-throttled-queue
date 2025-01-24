/**
 * @fileoverview Test the length of the queue
 */

const atq = require('../..');

describe('Throttling test', () => {
  test('Should throttle the second and then execute', async () => {
    const queue = atq(1, 1000);
    let isDone = false;
    await queue(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            isDone = true;
            resolve();
          }, 500);
        }),
    );
    await queue(
      () =>
        new Promise((resolve) => {
          expect(isDone).toBe(true);
          resolve();
        }),
    );
  });
});
