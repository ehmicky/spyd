import { extname } from 'path'

// Find the runners according to the tasks file extension.
// This might return an empty array since some `taskPaths` might have been
// selected by globbing pattern due to their siblings. E.g. `tasks.*`
// would catch `tasks.js` but also `tasks.js.map`, `tasks.js~`
// and so on. We silently ignore the files that have no runners.
export const findRunners = function (taskPath, runners) {
  const extension = extname(taskPath)
  const runnersA = runners.filter(({ extensions }) =>
    matchExtension(extensions, extension),
  )
  return runnersA
}

// Inverse.
// Only trigger `runner.commands()` if the runner is used by some tasks files.
export const hasTasks = function ({ extensions }, taskPaths) {
  return taskPaths.some((taskPath) =>
    matchExtension(extensions, extname(taskPath)),
  )
}

const matchExtension = function (extensions, extension) {
  return extensions.some((extensionA) => `.${extensionA}` === extension)
}
