import { promisify } from 'util'

// Async functions use different benchmarking logic.
// We only check once if `main()` is async in order to simplify the logic.
// This means `main()` cannot be sometimes sync and other times async.
// This does not apply to `before()` nor `after()`.
// We check by looking for the `async` keyword or `util.promisify`
// We do not call `main()` since it might be very slow.
export const isAsyncFunc = function (main) {
  return (
    main[Symbol.toStringTag] === 'AsyncFunction' ||
    main[promisify.custom] !== undefined
  )
}
