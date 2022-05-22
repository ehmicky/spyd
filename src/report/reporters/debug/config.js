import { validateEnum } from '../../../config/normalize/validate/enum.js'
import { validateDefinedString } from '../../../config/normalize/validate/simple.js'

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
    schema: { type: 'boolean' },
  },
  // Show header row
  {
    name: 'header',
    default: true,
    schema: { type: 'boolean' },
  },
  // Show empty columns
  {
    name: 'sparse',
    default: false,
    schema: { type: 'boolean' },
  },
  // List of stats to show.
  // By default, all stats are shown.
  // Order is significant as it is displayed in that order.
  {
    name: 'stats',
    default: ALL_STAT_NAMES,
    schema: { type: 'array' },
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
