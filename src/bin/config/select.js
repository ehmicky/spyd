import { SELECT } from './groups.js'

// Configuration shared by commands that can select combinations:
// `bench`, `exec`, `show`
export const SELECT_CONFIG = {
  include: {
    group: SELECT,
    alias: 'n',
    string: true,
    array: true,
    requiresArg: true,
  },
  exclude: {
    group: SELECT,
    alias: 'x',
    string: true,
    array: true,
    requiresArg: true,
  },
}
