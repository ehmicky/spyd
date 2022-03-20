import { list } from '../config/normalize/lib/wild_wild_path/main.js'

// Find leaf properties matching a specific condition.
// We make sure to use options which match which object gets recursed or not by
// the deep merging logic.
export const findValues = function (value, condition) {
  return list(value, '**', { leaves: true, entries: true }).filter(condition)
}
