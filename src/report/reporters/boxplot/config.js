import { validateBoolean } from '../../../config/normalize/validate/simple.js'

export const config = [
  // Hide `min`, `median` and `max` labels
  {
    name: 'mini',
    default: false,
    validate: validateBoolean,
  },
]
