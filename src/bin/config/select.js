// Configuration shared by commands that can select combinations:
// `bench`, `exec`, `show`
export const SELECT_CONFIG = {
  include: {
    alias: 'n',
    string: true,
    array: true,
    requiresArg: true,
  },
  exclude: {
    alias: 'x',
    string: true,
    array: true,
    requiresArg: true,
  },
}
