import sortOn from 'sort-on'

// Sort combinations so the fastest tasks will be first, then the fastest
// combinations within each task (regardless of column)
export const sortCombinations = function (combinations) {
  return sortOn(combinations, SORT_ORDER)
}

const SORT_ORDER = ['taskRank', 'runnerRank', 'systemRank']
