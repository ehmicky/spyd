import { DEFAULT_TASKS } from '../combination/tasks/find.js'
import { amongCommands } from '../config/normalize/pick.js'
import { normalizeOptionalArray } from '../config/normalize/transform.js'
import { validateRegularFile } from '../config/normalize/validate/fs.js'

const pick = amongCommands(['dev', 'run'])

const tasks = {
  name: 'tasks',
  pick,
  default: DEFAULT_TASKS,
  transform: normalizeOptionalArray,
}

const tasksAny = {
  name: 'tasks.*',
  pick,
  path: true,
  glob: true,
  validate: validateRegularFile,
}

const tasksFlatten = {
  name: 'tasks',
  pick,
  transform(value) {
    return value.flat()
  },
}

// Runner-specific shared configuration properties
export const sharedConfig = [tasks, tasksAny, tasksFlatten]
