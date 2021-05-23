import { isFile } from 'path-type'

import { UserError } from '../error/main.js'

// Retrieve the tasks file paths.
// Also validate that the files exist.
// Uses either the `tasks` or `runner{id}.tasks` configuration properties.
// There is no "fast mode" without tasks files. The fastest mode is to create
// a tasks file in `cwd` then run `spyd`
//  - This ensures the correct file extension is used which is important due to:
//     - syntax highlighting and IDE features
//     - runner might handle different file extensions differently
//       (e.g. *.ts transpiling)
//  - We do not provide inline `conf.[runnerRUNNER.]inline[.TASK[.STEP]]` "BODY"
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
export const getTaskPaths = async function (tasks) {
  await Promise.all(tasks.map(validateTask))
  return tasks
}

const validateTask = async function (taskPath) {
  if (!(await isFile(taskPath))) {
    throw new UserError(`Tasks file does not exist: ${taskPath}`)
  }
}
