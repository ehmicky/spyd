export const BUILTIN_RUNNERS = {
  node: () => import('./node/main.js'),
  cli: () => import('./cli/main.js'),
}

export const DEFAULT_RUNNERS = ['node']
