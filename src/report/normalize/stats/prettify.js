import { getStatsDecimals } from './decimals.js'
import { getScale } from './scale.js'
import { addSign } from './sign.js'
import { getUnit } from './unit.js'

// Create `stat.pretty` which stringifies, scales, rounds, adds decimals and
// adds a unit.
export const addStatsPretty = function ({
  combinations,
  allCombinations,
  name,
  kind,
  signed,
}) {
  const scale = getScale(allCombinations, name, kind)
  const unit = getUnit(kind, scale)
  const decimals = getStatsDecimals(combinations, name, scale)
  return combinations.map((combination) =>
    addStatPretty({ name, combination, signed, scale, unit, decimals }),
  )
}

// Some `stats` might be `undefined` for:
//  - all combinations when:
//     - `capabilities.debugStats` is `false` (for many stats)
//     - `showPrecision` is `false` or `true` (for `mean[Min|Max]`)
//     - `showDiff` is `false` or there is nothing to diff (for `diff`)
//  - some combinations when:
//     - there are only a few measures
//       (for all the precision-based stats like `stdev`)
// Additionally, at the beginning of the preview, all `stats` are `undefined`
const addStatPretty = function ({
  name,
  combination,
  combination: {
    stats,
    stats: { [name]: raw },
  },
  signed,
  scale,
  unit,
  decimals,
}) {
  if (raw === undefined) {
    return combination
  }

  const stat = Array.isArray(raw)
    ? raw.map((item) =>
        addItemPretty({ raw: item, signed, scale, unit, decimals, stats }),
      )
    : addItemPretty({ raw, signed, scale, unit, decimals, stats })
  return { ...combination, stats: { ...stats, [name]: stat } }
}

const addItemPretty = function ({ raw, signed, scale, unit, decimals, stats }) {
  const scaledRaw = raw / scale
  const roundedRaw = scaledRaw.toFixed(decimals)
  const pretty = `${roundedRaw}${unit}`
  const prettyA = addSign(pretty, signed, stats)
  return { raw, pretty: prettyA }
}
