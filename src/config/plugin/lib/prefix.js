import { findLastIndex } from '../../../utils/find.js'
import { setArray } from '../../../utils/set.js'
import { has } from '../../normalize/lib/prop_path/get.js'

// When the value was merged due to `duplicates` or to `sharedConfig`, ensure
// the prefix is correct
export const getPrefix = function (
  { unmergedConfig, parents, duplicateConfigs = [] },
  { path },
) {
  if (!has(unmergedConfig, path)) {
    return
  }

  const parentsA = fixDuplicateIndex(parents, duplicateConfigs, path)
  return `${parentsA}.`
}

const fixDuplicateIndex = function (parents, duplicateConfigs, path) {
  const index = findLastIndex(duplicateConfigs, (duplicateConfig) =>
    has(duplicateConfig, path),
  )

  if (index === -1) {
    return parents
  }

  const parentsA = parents.split('.')
  const parentsB = setArray(parentsA, parentsA.length - 1, index)
  return parentsB.join('.')
}
