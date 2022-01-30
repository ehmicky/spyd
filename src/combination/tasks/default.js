import { basename } from 'path'

import { isNotJunk } from 'junk'

import { lookupFiles } from '../../config/lookup.js'
import { getTopPropCwd } from '../../config/normalize/cwd.js'

// Apply default value for `tasks`. Applied on each runner.
// This only applies when `tasks` is `undefined`.
// An empty array resolves to no files instead
//  - This can be useful in programmatic usage
//  - This is only useful when using several runners. If all runners have no
//    tasks, the run will fail.
export const getDefaultTasks = async function ({ context: { configInfos } }) {
  const base = getTopPropCwd(configInfos)
  return await lookupFiles(isTaskPath, base)
}

const isTaskPath = function (filePath) {
  const filename = basename(filePath)
  return filename.startsWith(TASKS_BASENAME) && isNotJunk(filename)
}

const TASKS_BASENAME = 'tasks.'
