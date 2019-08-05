import { isPromiseLike } from '../../utils/main.js'

// Async functions use different benchmarking logic.
// We only check once if `main()` is async in order to simplify the logic.
// This means `main()` cannot be sometimes sync and other times async.
// This does not apply to `before()` nor `after()`.
export const isAsyncFunc = function(func) {
  // Only meant as a shortcut to avoid calling `main()` when possible.
  // The function might still be async if it returns a promise but was not
  // declared with `async/await`.
  if (func[Symbol.toStringTag] === 'AsyncFunction') {
    return true
  }

  const returnValue = func()

  if (!isPromiseLike(returnValue)) {
    return false
  }

  returnValue.catch(errorNoop)
  return true
}

// eslint-disable-next-line no-empty-function
const errorNoop = function() {}
