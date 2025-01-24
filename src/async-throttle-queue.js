/**
 * Async Throttle Queue
 * Asynchronously execute a queue of functions, limiting the number of concurrent executions.
 *
 * https://github.com/thanpolas/async-throttle-queue
 *
 * Copyright © Thanos Polychronakis
 * LICENSE on /LICENSE file.
 */

/**
 * @fileoverview bootstrap and master exporting module.
 */

const allQueues = [];

/**
 * Disposes of all queues.
 */
exports.dispose = () => {
  for (const ts of allQueues) {
    if (ts.timeout) {
      clearTimeout(ts.timeout);
    }
  }
};

/**
 * The main function that creates a new throttle queue.
 *
 * @param {number} maxRequestsPerInterval The maximum number of requests to execute per interval.
 * @param {number} interval The interval in milliseconds.
 * @param {boolean} evenlySpaced If all requests should be evenly
 * @return {function} The throttler function.
 */
const atq = (module.exports = (
  maxRequestsPerInterval,
  interval,
  evenlySpaced,
) => {
  /**
   * If all requests should be evenly spaced, adjust to suit.
   */
  if (evenlySpaced) {
    interval = interval / maxRequestsPerInterval;
    maxRequestsPerInterval = 1;
  }

  const throttleState = {
    queue: [],
    interval,
    maxRequestsPerInterval,
    lastIntervalStart: 0,
    numRequestsPerInterval: 0,
    timeout: null,
    activeRequests: 0,
  };

  allQueues.push(throttleState);

  const throttler = exports.throttlerFn.bind(null, throttleState);

  Object.defineProperty(throttler, 'length', {
    get: () => {
      return throttleState.activeRequests;
    },
  });
  Object.defineProperty(throttler, 'queue', {
    get: () => {
      return throttleState.queue.length;
    },
  });
  Object.defineProperty(throttler, 'total', {
    get: () => {
      return throttleState.queue.length + throttleState.activeRequests;
    },
  });

  return throttler;
});

// Attach dispose on exported fn.
atq.dispose = exports.dispose;

/**
 * Gets called at a set interval to remove items from the queue.
 * This is a self-adjusting timer, since the browser's setTimeout is highly inaccurate.
 *
 * @param {Object} ts Throttle state object.
 */
exports.dequeue = (ts) => {
  const intervalEnd = ts.lastIntervalStart + ts.interval;
  const now = Date.now();
  /**
   * Adjust the timer if it was called too early.
   */
  if (now < intervalEnd) {
    if (ts.timeout) {
      clearTimeout(ts.timeout);
    }
    ts.timeout = setTimeout(exports.dequeue.bind(null, ts), intervalEnd - now);
    return;
  }

  ts.lastIntervalStart = now;
  ts.numRequestsPerInterval = 0;
  for (const callback of ts.queue.splice(0, ts.maxRequestsPerInterval)) {
    ts.numRequestsPerInterval += 1;
    ts.activeRequests += 1;
    callback().finally(() => {
      ts.activeRequests -= 1;
    });
  }
  if (ts.queue.length) {
    ts.timeout = setTimeout(exports.dequeue.bind(null, ts), ts.interval);
  } else {
    ts.timeout = undefined;
  }
};

/**
 * The actual throttling function.
 *
 * @param {Object} ts Throttle state object.
 * @param {function} fn Function to throttle.
 * @return {Promise<*>} The promise of the function.
 */
exports.throttlerFn = (ts, fn) => {
  return new Promise((resolve, reject) => {
    const callback = () =>
      Promise.resolve()
        .then(fn)
        .then(resolve)
        .catch(reject)
        .finally(() => {
          ts.activeRequests -= 1;
        });

    const now = Date.now();
    if (!ts.timeout && now - ts.lastIntervalStart > ts.interval) {
      ts.lastIntervalStart = now;
      ts.numRequestsPerInterval = 0;
    }

    ts.numRequestsPerInterval += 1;
    if (ts.numRequestsPerInterval <= ts.maxRequestsPerInterval) {
      ts.activeRequests += 1;
      callback();
    } else {
      ts.queue.push(callback);
      if (!ts.timeout) {
        ts.timeout = setTimeout(
          exports.dequeue.bind(null, ts),
          ts.lastIntervalStart + ts.interval - now,
        );
      }
    }
  });
};
