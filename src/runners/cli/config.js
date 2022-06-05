// We only allow shells that are cross-platform
const SHELL_VALUES = ['none', 'sh', 'bash']
// Shells have a performance impact and are less portable, so they are opt-in
const DEFAULT_SHELL = 'none'

export const config = new Set([
  {
    name: 'shell',
    default: DEFAULT_SHELL,
    schema: {
      type: 'string',
      enum: SHELL_VALUES,
      errorMessage: { enum: `must be one of: ${SHELL_VALUES.join(', ')}` },
    },
  },
])
