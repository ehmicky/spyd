import { normalizeOptionalArray } from '../../../config/normalize/transform.js'
import { validateDefinedString } from '../../../config/normalize/validate/simple.js'
import { EXAMPLE_REQUIRE } from '../handler/start/require_config.js'

import { versionDefinition } from './version.js'

export const config = [
  versionDefinition,
  {
    name: 'require',
    default: [],
    transform: normalizeOptionalArray,
  },
  {
    name: 'require.*',
    validate: validateDefinedString,
    example: EXAMPLE_REQUIRE,
  },
]
