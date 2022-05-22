import { normalizeArray } from '../../../config/normalize/transform.js'
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
    schema: {
      type: 'string',
      minLength: 1,
      errorMessage: { minLength: 'must not be an empty string' },
    },
    example: EXAMPLE_REQUIRE,
  },
]
