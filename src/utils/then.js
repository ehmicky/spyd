// Allow a function to be either sync or async depending on its input.
/* eslint-disable promise/prefer-await-to-callbacks,
   promise/no-callback-in-promise, promise/prefer-await-to-then */
export const then = function (maybePromise, callback) {
  return typeof maybePromise.then === 'function'
    ? maybePromise.then(callback)
    : callback(maybePromise)
}
/* eslint-enable promise/prefer-await-to-callbacks,
   promise/no-callback-in-promise, promise/prefer-await-to-then */
