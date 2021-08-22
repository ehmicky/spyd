// Retrieve all `stats.*` properties to prettify
// `histogram` does not need to be prettified.
export const getStatKinds = function (combinations) {
  return STAT_KINDS.filter((statKind) => hasStatKind(statKind, combinations))
}

// Kind of each `stat` to prettify.
const STAT_KINDS = [
  { name: 'median', kind: 'duration' },
  { name: 'medianMin', kind: 'duration' },
  { name: 'medianMax', kind: 'duration' },
  { name: 'mean', kind: 'duration' },
  { name: 'min', kind: 'duration' },
  { name: 'max', kind: 'duration' },
  { name: 'diff', kind: 'percentage', signed: 'diff' },
  { name: 'stdev', kind: 'duration', signed: 'never' },
  { name: 'rstdev', kind: 'percentage', signed: 'never' },
  { name: 'moe', kind: 'duration', signed: 'never' },
  { name: 'rmoe', kind: 'percentage', signed: 'never' },
  { name: 'times', kind: 'count' },
  { name: 'loops', kind: 'count' },
  { name: 'repeat', kind: 'count' },
  { name: 'samples', kind: 'count' },
  { name: 'minLoopDuration', kind: 'duration' },
  { name: 'quantiles', kind: 'duration' },
]

// Some `stats` might be `undefined` when:
//  - `debugStats` is `false` (for many stats)
//  - `showPrecision` is `false` or `true` (for `median[Min|Max]`)
//  - `showDiff` is `false` or there is nothing to diff (for `diff`)
//  - `median` is `0` or there are only a few measures (for all the
//    precision-based stats like `stdev`)
const hasStatKind = function ({ name }, [{ stats }]) {
  return stats[name] !== undefined
}
