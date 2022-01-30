export const BUILTIN_RUNNERS = {
  node: () => import('./node/main.js'),
  cli: () => import('./cli/main.js'),
}

// We default `runner` to `node` only instead of several ones (e.g. `cli`)
// because this enforces that the `runner` property points to a required tasks
// file, instead of to an optional one. This makes behavior easier to
// understand for users and provides with better error messages.
export const DEFAULT_RUNNERS = ['node']
