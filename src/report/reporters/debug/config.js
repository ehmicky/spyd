import {
  ALL_STAT_NAMES,
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
    required: true,
    schema: {
      type: 'string',
      enum: ALL_STAT_NAMES,
      errorMessage: { enum: `must be one of: ${ALL_STAT_NAMES.join(', ')}` },
    },
    example: EXAMPLE_STAT_NAME,
  },
]
