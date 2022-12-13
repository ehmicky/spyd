// The combination initialization error handler logic means if an asynchronous
// error happens during initialization, it will wait for it to end before
// throwing.
// To avoid `unhandledRejection` event, we attach a noop error handler.
export const noUnhandledRejection = (promise) => {
  // eslint-disable-next-line promise/prefer-await-to-then
  promise.catch(noop)
  return promise
}

// eslint-disable-next-line no-empty-function
const noop = () => {}
