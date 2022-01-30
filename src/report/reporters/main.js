export const BUILTIN_REPORTERS = {
  boxplot: () => import('./boxplot/main.js'),
  debug: () => import('./debug.js'),
  histogram: () => import('./histogram/main.js'),
  history: () => import('./history.js'),
}

export const DEFAULT_REPORTERS = ['debug']
