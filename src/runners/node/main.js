import { normalizeNumberString } from '../../config/normalize/transform.js'
import { validateNumberString } from '../../config/normalize/validate.js'

export { launch } from './launch/main.js'

export const config = [
  {
    name: 'version',
    validate: validateNumberString,
    transform: normalizeNumberString,
  },
]
