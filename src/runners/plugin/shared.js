import { DEFAULT_TASKS } from '../../combination/tasks/find.js'
import { amongCommands } from '../../config/normalize/pick.js'
import { normalizeArray } from '../../config/normalize/transform.js'
import { validateJson } from '../../config/normalize/validate/json.js'
import { normalizeConfigSelectors } from '../../config/select/normalize.js'

const pick = amongCommands(['dev', 'run'])

const any = {
  name: '**',
  pick,
  validate: validateJson,
}

const tasks = {
  name: 'tasks',
  pick,
  default: DEFAULT_TASKS,
  transform: normalizeArray,
}

const tasksAny = {
  name: 'tasks.*',
  required: true,
  pick,
  glob: true,
  example: DEFAULT_TASKS,
}

const tasksFlatten = {
  name: 'tasks',
  pick,
  transform(value) {
    return value.flat()
  },
}

// Runner-specific shared configuration properties
export const shared = normalizeConfigSelectors([
  any,
  tasks,
  tasksAny,
  tasksFlatten,
])
