import { iterate } from '../wild_wild_path/main.js'

// Find the first non-missing property that matches a condition
// eslint-disable-next-line max-params
export const find = function (
  target,
  query,
  condition,
  { childFirst, sort, classes } = {},
) {
  // eslint-disable-next-line fp/no-loops
  for (const entry of iterate(target, query, { childFirst, sort, classes })) {
    // eslint-disable-next-line max-depth
    if (!entry.missing && condition(entry)) {
      return entry
    }
  }
}
