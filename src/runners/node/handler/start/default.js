import { promisify } from 'util'

import mapObj from 'map-obj'

// Add default values for tasks
export const addDefaults = function (tasks) {
  return mapObj(tasks, addDefault)
}

const addDefault = function (
  taskId,
  {
    beforeAll,
    beforeEach,
    main,
    afterEach,
    afterAll,
    async = isAsyncFunc(main),
  },
) {
  return [taskId, { beforeAll, beforeEach, main, afterEach, afterAll, async }]
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
