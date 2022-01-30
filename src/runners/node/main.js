import { normalizeNumberString } from '../../config/normalize/transform.js'
import { validateNumberString } from '../../config/normalize/validate.js'

import { transformVersion, validateVersion } from './version.js'

export { launch } from './launch.js'

export const config = [
  {
    name: 'version',
    validate: validateNumberString,
    transform: normalizeNumberString,
  },
  {
    name: 'version',
    validate: validateVersion,
    transform: transformVersion,
  },
]
