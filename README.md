# Async Throttle Queue

> Asynchronously execute a queue of functions, limiting the number of concurrent executions.

[![NPM Version][npm-image]][npm-url]
[![CircleCI](https://circleci.com/gh/thanpolas/async-throttle-queue.svg?style=svg)](https://circleci.com/gh/thanpolas/async-throttle-queue)
[![Twitter Follow](https://img.shields.io/twitter/follow/thanpolas.svg?label=thanpolas&style=social)](https://twitter.com/thanpolas)

_Inspired and cloned from [shaunpersad's "throttled-queue"][orig-queue]_

## Install

Install the module using NPM:

```
npm install @thanpolas/async-throttle-queue --save
```

## Documentation

Throttles arbitrary code to execute a maximum number of times per interval. Best for making throttled API requests.

For example, making network calls to popular APIs such as Twitter is subject to rate limits. By wrapping all of your API calls in a throttle, it will automatically adjust your requests to be within the acceptable rate limits.

Unlike the `throttle` functions of popular libraries like lodash and underscore, `throttled-queue` will not prevent any executions. Instead, every execution is placed into a queue, which will be drained at the desired rate limit.

A new `dispose()` method has been added to the `throttle` instance, which will clear the queue and stop any further executions.

### Usage

```javascript
const atq = require('@thanpolas/async-throttle-queue');

// Create an instance of a throttled queue by specifying the maximum number
// of requests as the first parameter, and the interval in milliseconds as the second:
const throttle = atq(5, 1000); // at most 5 requests per second.

// Use the `throttle` instance as a function to enqueue actions:
await throttle(() => {
    // perform some type of async activity in here.
    return Promise.resolve('hello!');
});

// Get the total queued functions on the throttle instance.
console.log(throttle.queued);
```

### Bursts

By specifying a number higher than 1 as the first parameter, you can dequeue multiple actions within the given interval:

```javascript
const atq = require('@thanpolas/async-throttle-queue');
const throttle = atq(10, 1000); // at most make 10 requests every second.

for (let x = 0; x < 100; x++) {
    await throttle(() => {
        // This will fire at most 10 a second, as rapidly as possible.
        return fetch('https://api.github.com/search/users?q=shaunpersad');
    });
}
```

### Evenly spaced

You can space out your actions by specifying `true` as the third (optional) parameter:

```javascript
const atq = require('@thanpolas/async-throttle-queue');
const throttle = atq(10, 1000, true); // at most make 10 requests every second, but evenly spaced.

for (let x = 0; x < 100; x++) {
    async throttle(() => {
        // This will fire at most 10 requests a second, spacing them out instead of in a burst.
        return fetch('https://api.github.com/search/users?q=shaunpersad');
    });
}
```

### Disposing

You can stop the throttle and clear the queue by calling the `dispose()` method.

Notes:

1. This will not stop any currently executing actions, but will prevent any further actions from being enqueued.
2. After calling `dispose()`, the internal state of queues is reset, and the already existing throttles should not be used again.
3. Call `dispose()` when your application is shutting down to prevent uncalled actions from being executed and halting the shutdown process.

```javascript
const atq = require('@thanpolas/async-throttle-queue');

atq.dispose();
```

## Update Node Version

When a new node version is available you need to updated it in the following:

-   `/package.json`
-   `/.nvmrc`
-   `/.circleci/config.yml`

## Releasing

1. Update the changelog bellow ("Release History").
1. Ensure you are on master and your repository is clean.
1. Type: `npm run release` for patch version jump.
    - `npm run release:minor` for minor version jump.
    - `npm run release:major` for major major jump.

## Release History

-   **v0.0.3**, _14/Jan/2025_
    -   Fixed dispose() not properly being exposed.
-   **v0.0.2**, _13/Jan/2025_
    -   Fix master export.
-   **v0.0.1**, _13/Jan/2025_
    -   Big Bang

## License

Copyright © [Thanos Polychronakis][thanpolas] and Authors, [Licensed under ISC](/LICENSE).

[npm-url]: https://npmjs.org/package/@thanpolas/async-throttle-queue
[npm-image]: https://img.shields.io/npm/v/@thanpolas/async-throttle-queue.svg
[thanpolas]: https://github.com/thanpolas
[orig-queue]: https://github.com/shaunpersad/throttled-queue
