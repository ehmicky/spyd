import { extname } from 'path'

// Find the runners according to the task file extension.
// This might return an empty array since some `taskPaths` might have been
// selected by globbing pattern due to their siblings. E.g. `benchmarks.*`
// would catch `benchmarks.js` but also `benchmarks.js.map`, `benchmarks.js~`
// and so on. We silently ignore the files that have no runners.
export const findRunners = function(taskPath, runners) {
  const extension = extname(taskPath)
  const runnersA = runners.filter(({ extensions }) =>
    matchExtension(extensions, extension),
  )
  return runnersA
}

const matchExtension = function(extensions, extension) {
  return extensions.some(extensionA => `.${extensionA}` === extension)
}

// Inverse.
// Only trigger `runner.action` is the runner is used by some task files.
export const hasTasks = function({ extensions }, taskPaths) {
  return taskPaths.some(taskPath =>
    matchExtension(extensions, extname(taskPath)),
  )
}
