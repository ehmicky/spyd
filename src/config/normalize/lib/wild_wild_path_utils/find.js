import { iterate } from '../wild_wild_path/main.js'

// Find the first non-missing property that matches a condition
export const find = function (target, query, condition) {
  // eslint-disable-next-line fp/no-loops
  for (const entry of iterate(target, query)) {
    // eslint-disable-next-line max-depth
    if (!entry.missing && condition(entry)) {
      return entry
    }
  }
}
