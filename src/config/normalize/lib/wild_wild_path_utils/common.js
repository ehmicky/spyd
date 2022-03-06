import { list } from '../wild_wild_path/main.js'

// `list()` but without missing entries
export const listExisting = function (target, queryOrPath) {
  return list(target, queryOrPath).filter(isExisting)
}

const isExisting = function ({ missing }) {
  return !missing
}
