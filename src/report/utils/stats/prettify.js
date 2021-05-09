import { getStatsDecimals } from './decimals.js'
import { getScale } from './scale.js'
import { addSign } from './sign.js'
import { getUnit } from './unit.js'

// Rename `stat` to `stat.raw` and create `stat.pretty` which stringifies,
// scales, rounds, adds decimals and adds a unit.
export const addStatsPretty = function ({ combinations, name, kind, signed }) {
  const scale = getScale(combinations, name, kind)
  const unit = getUnit(kind, scale)
  const decimals = getStatsDecimals(combinations, name, scale)
  return combinations.map((combination) =>
    addStatPretty({ name, combination, signed, scale, unit, decimals }),
  )
}

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
  const pretty = addItemsPretty({ raw, signed, scale, unit, decimals })
  return { ...combination, stats: { ...stats, [name]: { raw, pretty } } }
}

// Statistics are not shown if undefined (e.g. `diff` with no previous results,
// or not-measure-yet in preview)
const addItemsPretty = function ({ raw, signed, scale, unit, decimals }) {
  if (raw === undefined) {
    return ''
  }

  return Array.isArray(raw)
    ? raw.map((item) =>
        addItemPretty({ raw: item, signed, scale, unit, decimals }),
      )
    : addItemPretty({ raw, signed, scale, unit, decimals })
}

const addItemPretty = function ({ raw, signed, scale, unit, decimals }) {
  const scaledRaw = raw / scale
  const roundedRaw = scaledRaw.toFixed(decimals)
  const pretty = `${roundedRaw}${unit}`
  const prettyA = addSign(pretty, signed)
  return prettyA
}
