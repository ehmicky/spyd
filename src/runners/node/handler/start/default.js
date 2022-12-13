import { promisify } from 'node:util'

import { mapValues } from '../../../../utils/map.js'

// Add default values for tasks
export const addDefaults = (tasks) => mapValues(tasks, addDefault)

const addDefault = ({
  beforeAll,
  beforeEach,
  main,
  afterEach,
  afterAll,
  async = isAsyncFunc(main),
}) => ({ beforeAll, beforeEach, main, afterEach, afterAll, async })

// Async functions use different measuring logic.
// We only check once if `main()` is async in order to simplify the logic.
// This means `main()` cannot be sometimes sync and other times async.
// This does not apply to `beforeEach()` nor `afterEach()`.
// We check by looking for the `async` keyword or `util.promisify`
// We do not call `main()` since it might be very slow.
const isAsyncFunc = (main) =>
  main[Symbol.toStringTag] === 'AsyncFunction' ||
  main[promisify.custom] !== undefined
