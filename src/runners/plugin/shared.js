import { DEFAULT_TASKS } from '../../combination/tasks/find.js'
import { amongCommands } from '../../config/normalize/pick.js'
import { normalizeArray } from '../../config/normalize/transform.js'
import { validateJson } from '../../config/normalize/validate/json.js'
import { normalizeConfigSelectors } from '../../config/select/normalize.js'

const pick = amongCommands(['dev', 'run'])

// Runner-specific shared configuration properties
const sharedRules = [
  {
    name: '**',
    pick,
    validate: validateJson,
  },
  {
    name: 'tasks',
    pick,
    default: DEFAULT_TASKS,
    transform: normalizeArray,
  },
  {
    name: 'tasks.*',
    required: true,
    pick,
    glob: true,
    example: DEFAULT_TASKS,
  },
  {
    name: 'tasks',
    pick,
    transform: (value) => value.flat(),
  },
]

export const shared = normalizeConfigSelectors(sharedRules)
