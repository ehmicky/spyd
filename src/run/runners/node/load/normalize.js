import { promisify } from 'util'

// Normalize task properties names
export const normalizeTasks = function ({ tasks, inputs }) {
  const tasksA = tasks.map(normalizeTask)
  return { tasks: tasksA, inputs }
}

const normalizeTask = function ({
  id: taskId,
  title: taskTitle,
  inputs: inputsIds,
  main,
  before,
  after,
  async = isAsyncFunc(main),
}) {
  return { taskId, taskTitle, inputsIds, main, before, after, async }
}

// Async functions use different measuring logic.
// We only check once if `main()` is async in order to simplify the logic.
// This means `main()` cannot be sometimes sync and other times async.
// This does not apply to `before()` nor `after()`.
// We check by looking for the `async` keyword or `util.promisify`
// We do not call `main()` since it might be very slow.
const isAsyncFunc = function (main) {
  return (
    main[Symbol.toStringTag] === 'AsyncFunction' ||
    main[promisify.custom] !== undefined
  )
}
