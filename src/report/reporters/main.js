export const BUILTIN_REPORTERS = {
  boxplot: () => import('./boxplot/main.js'),
  debug: () => import('./debug/main.js'),
  histogram: () => import('./histogram/main.js'),
  history: () => import('./history/main.js'),
}

export const DEFAULT_REPORTERS = ['debug']
