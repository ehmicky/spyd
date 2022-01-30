import {
  validateDefinedString,
  validateEnum,
} from '../../config/normalize/validate.js'

// We only allow shells that are cross-platform
const SHELL_VALUES = new Set(['none', 'sh', 'bash'])
// Shells have a performance impact and are less portable, so they are opt-in
const DEFAULT_SHELL = 'none'

export const config = [
  {
    name: 'shell',
    default: DEFAULT_SHELL,
    validate(value) {
      validateDefinedString(value)
      validateEnum(value, SHELL_VALUES)
    },
  },
]
