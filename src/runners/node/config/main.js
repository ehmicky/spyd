import { normalizeArray } from '../../../config/normalize/transform.js'
import { validateDefinedString } from '../../../config/normalize/validate/simple.js'
import { EXAMPLE_REQUIRE } from '../handler/start/require_config.js'

import { versionRule } from './version.js'

export const config = [
  versionRule,
  {
    name: 'require',
    default: [],
    transform: normalizeArray,
  },
  {
    name: 'require.*',
    validate: validateDefinedString,
    example: EXAMPLE_REQUIRE,
  },
]
