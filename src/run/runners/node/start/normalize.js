import { promisify } from 'util'

import mapObj from 'map-obj'

// Normalize and add default values for tasks
export const normalizeTasks = function (tasks) {
  return mapObj(tasks, normalizeTask)
}

// Tasks can be directly a function, which is a shortcut for `{ main }`
const normalizeTask = function (taskId, task) {
  const taskA = typeof task === 'function' ? { main: task } : task
  const {
    beforeAll,
    beforeEach,
    main,
    afterEach,
    afterAll,
    async = isAsyncFunc(main),
  } = taskA
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
