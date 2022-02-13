import { validateArray } from '../../../config/normalize/validate/complex.js'
import { validateEnum } from '../../../config/normalize/validate/enum.js'
import {
  validateBoolean,
  validateDefinedString,
} from '../../../config/normalize/validate/simple.js'

import {
  ALL_STAT_NAMES,
  ALL_STAT_NAMES_SET,
  EXAMPLE_STAT_NAMES,
  EXAMPLE_STAT_NAME,
} from './stats.js'

export const config = [
  // Make table more compact, hiding columns separators
  {
    name: 'mini',
    default: false,
    validate: validateBoolean,
  },
  // Show header row
  {
    name: 'header',
    default: true,
    validate: validateBoolean,
  },
  // Show empty columns
  {
    name: 'sparse',
    default: false,
    validate: validateBoolean,
  },
  // List of stats to show.
  // By default, all stats are shown.
  // Order is significant as it is displayed in that order.
  {
    name: 'stats',
    default: ALL_STAT_NAMES,
    validate: validateArray,
    example: EXAMPLE_STAT_NAMES,
  },
  {
    name: 'stats.*',
    validate(value) {
      validateDefinedString(value)
      validateEnum(value, ALL_STAT_NAMES_SET)
    },
    example: EXAMPLE_STAT_NAME,
  },
]
