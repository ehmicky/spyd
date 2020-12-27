import { promisify } from 'util'

// Add default values for tasks
export const normalizeTask = function ({
  main,
  beforeEach,
  afterEach,
  async = isAsyncFunc(main),
}) {
  return { main, beforeEach, afterEach, async }
}

// Async functions use different measuring logic.
// We only check once if `main()` is async in order to simplify the logic.
// This means `main()` cannot be sometimes sync and other times async.
// This does not apply to `beforeEach()` nor `afterEach()`.
// We check by looking for the `async` keyword or `util.promisify`
// We do not call `main()` since it might be very slow.
const isAsyncFunc = function (main) {
  return (
    main[Symbol.toStringTag] === 'AsyncFunction' ||
    main[promisify.custom] !== undefined
  )
}
