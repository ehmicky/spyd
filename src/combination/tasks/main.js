import { handlePluginError } from '../../config/plugin/error.js'
import { BaseError, PluginError } from '../../error/main.js'
import { getCommonVersions } from '../../top/system/versions/common.js'
import { getCombsNoDimensions } from '../filter.js'

import { findTasks } from './find.js'
import { loadRunner } from './load.js'

// The tasks file for each runner is selected using either the `tasks` or
// `runner.tasks` configuration properties.
// We allow it as a positional CLI flag:
//  - This is what many users would expect
//  - This allows users to do on-the-fly benchmarks without pre-existing setup
// The `tasks` are only needed when measuring them, not reporting them, so not
// all commands use it.
// A tasks file might have several tasks because:
//  - This is user-friendlier when using small tasks and/or single steps
//  - This prevents users using steps when they meant to use tasks
// There can optionally be several tasks files per runner because:
//  - This allows shared configurations' tasks to be overridden
//     - `select` can be used to exclude those instead
//  - This allows breaking down tasks files:
//     - This is faster when some tasks files are slow to load or have many
//       tasks
//     - This might be convenient by avoid big files when there are many tasks
//        - Not every file format can do this (e.g. with re-exports).
//          For example, this is possible in JavaScript but not in YAML.
//  - The downside is that users might mistakenly target dependent files instead
//    of main files. We document against it.
// Globbing patterns are allowed to help with this.
// We make the steps vs tasks distinction clear:
//  - Syntactically by requiring an additional depth level (nested object) for
//    steps
//  - We encourage tasks over steps
// Runners are encouraged to clearly separate task and step identifiers in tasks
// files.
//  - For example, not allowing users to concatenate them into a single
//    identifiers.
//  - This makes it clearer for users which is which.
// Specifying an empty `tasks` array is allowed:
//  - This is useful when `tasks` is computed dynamically, or when requiring
//    `tasks` to be overridden by shared configuration's consumer or using CLI
//    flags
//  - However, if all runners have no tasks, an error will be thrown since there
//    won't be any combinations to measure
// There is no "fast mode" without tasks files. The fastest mode is to create
// a tasks file in `cwd` then run `spyd`
//  - This ensures the correct file extension is used which is important due to:
//     - syntax highlighting and IDE features
//     - runner might handle different file extensions differently
//       (e.g. *.ts transpiling)
//  - We do not provide inline
//    `config.[runner.]inline[.{taskId}[.{stepId}]]` "BODY"
//    since this would:
//     - Not allow defining content outside function body (e.g. imports) nor
//       function declaration (e.g. async keyword)
//        - This would be even more of a problem with some languages that use
//          more top-level declarations
//     - Encourage sharing tasks by sharing command lines, instead of using
//       shareable modules
//     - Require entering long statements on command line, which is not
//       ergonomic: no syntax highlighting, linting, autocompletion, etc.
//     - Be harder to specify file extension
//  - We do no provide `conf.tasks` "temp", creating a temp file on user behalf
//    since it would require either:
//     - Opening editor in a new tab|window, which is hard to do cross-platform
//     - Using same tab for both edit and benchmark, resulting in a poor
//       experience
// Runners are specified using the `runner` configuration property. Other
// solutions have problems:
//  - using code comment:
//     - this requires reading files, which is slow with big files
//     - transpiling might remove code comments
//     - this does not work in compiled binaries
//  - using the task filenames:
//     - this does not allow multiple runners per task
//     - this leads to odd filenames when the runner and file extension are
//       similar or the same
//  - looking into `package.json` or `node_modules` for all the installed
//    runners
//     - too implicit/magic
//     - this might give false positives, especially due to nested dependencies
//     - this does not work well with bundled runners
export const listTasks = async function (runners, cwd) {
  const commonVersions = await getCommonVersions()
  const dimensionsArray = runners.map(getDimensions)
  const noDimensions = getCombsNoDimensions(dimensionsArray)
  const tasks = await Promise.all(
    dimensionsArray.map((dimensions) =>
      getDimensionsTasks({ dimensions, noDimensions, cwd, commonVersions }),
    ),
  )
  return tasks.flat().filter(hasUniqueTaskId)
}

const getDimensions = function (runner) {
  return { runner }
}

const getDimensionsTasks = async function ({
  dimensions: {
    runner,
    runner: { bugs },
  },
  noDimensions,
  cwd,
  commonVersions,
}) {
  try {
    const runnerA = await loadRunner(runner, cwd, commonVersions)
    const tasks = await Promise.all(
      runnerA.config.tasks.map((taskPath) =>
        findTasks({ taskPath, runner: runnerA, noDimensions, cwd }),
      ),
    )
    return tasks.flat()
  } catch (error) {
    throw handlePluginError({ error, bugs, PluginError, BaseError })
  }
}

// When two task files export the same task id, we only keep one based on the
// following priority:
//  - `config.runner.tasks` over `config.tasks`
//  - `tasks` array order (last has priority)
// This allows overriding tasks when using shared configurations.
// This only applies when the task files are using the same runner.
const hasUniqueTaskId = function (task, index, tasks) {
  return tasks
    .slice(index + 1)
    .every(({ id, runner }) => id !== task.id || runner.id !== task.runner.id)
}
