// Split functions into two: sync and async.
// A `sync` boolean is passed as first argument.
// The async method uses `async`/`await` to:
//  - Ensure the return value is always a promise
//  - Keep the top-level call in the stack trace
export const create = function (func) {
  return [
    (...args) => func(true, ...args),
    async (...args) => await func(false, ...args),
  ]
}

// Call either a sync or async function depending on the `sync` boolean argument
// If passed, a `callback()` is called with the return value.
// The caller must immediately return this function's return value as it might
// be a promise.
// Stack traces:
//  - When async, stack traces of the caller functions are lost unless using
//    those are using `async`/`await`.
//     - This is not possible for the function calling `thenCall()`, and is
//       often not possible either for the parents.
//  - Stack traces of `callback()` and children are kept.
// eslint-disable-next-line max-params, complexity
export const call = function (
  sync,
  syncMethod,
  asyncMethod,
  // eslint-disable-next-line default-param-last
  args = [],
  callback,
  errorHandler,
) {
  const maybePromise = sync ? syncMethod(...args) : asyncMethod(...args)

  if (callback === undefined) {
    return maybePromise
  }

  if (isPromise(maybePromise)) {
    // eslint-disable-next-line promise/prefer-await-to-then, promise/no-callback-in-promise
    return maybePromise.then(callback, errorHandler)
  }

  if (errorHandler === undefined) {
    // eslint-disable-next-line promise/prefer-await-to-callbacks
    return callback(maybePromise)
  }

  try {
    // eslint-disable-next-line promise/prefer-await-to-callbacks
    return callback(maybePromise)
  } catch (error) {
    return errorHandler(error)
  }
}

const isPromise = function (maybePromise) {
  return (
    typeof maybePromise === 'object' &&
    maybePromise !== null &&
    // eslint-disable-next-line promise/prefer-await-to-then
    typeof maybePromise.then === 'function'
  )
}
