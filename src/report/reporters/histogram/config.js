import { validateBoolean } from '../../../config/normalize/validate.js'

export const config = [
  // Hide the abscissa with the `min`, `median` and `max` labels
  {
    name: 'mini',
    default: false,
    validate: validateBoolean,
  },
  // Smooth the histogram values.
  // This is especially useful when there are only a few measures that are all
  // integers.
  {
    name: 'smooth',
    default: true,
    validate: validateBoolean,
  },
]
