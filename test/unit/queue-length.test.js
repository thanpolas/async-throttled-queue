/**
 * @fileoverview Test the length of the queue
 */

const atq = require('../..');

describe('Queue length', () => {
  test('Should report expected length', async () => {
    const queue = atq(5, 1000);
    // create two promises
    queue(() => new Promise(() => {}));
    queue(() => new Promise(() => {}));

    expect(queue.length).toBe(2);
  });
  test('Should report expected length and queue', async () => {
    const queue = atq(2, 1000);
    // create two promises
    queue(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 500);
        }),
    );
    queue(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 500);
        }),
    );
    queue(() => new Promise(() => {}));

    expect(queue.length).toBe(2);
    expect(queue.queue).toBe(1);
    expect(queue.total).toBe(3);
  });
});
