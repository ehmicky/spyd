import {
  titleColor,
  separatorColor,
  errorColor,
  fieldColor,
} from '../utils/colors.js'
import { getFooter } from '../utils/footer/main.js'
import { joinSections } from '../utils/join.js'
import { addNames } from '../utils/name/main.js'
import { prettifyValue } from '../utils/prettify_value.js'
import { SEPARATOR_SIGN } from '../utils/separator.js'
import { prettifyStats } from '../utils/stats/main.js'

// Debugging reporter only meant for development purpose
const report = function ({
  commands,
  systems,
  mergeId,
  timestamp,
  git,
  ci,
  iterations,
}) {
  const iterationsA = prettifyStats(iterations)
  const iterationsB = addNames(iterationsA)
  const content = iterationsB.map(serializeIteration).join('\n')
  const footer = prettifyValue(
    getFooter({ commands, systems, mergeId, timestamp, git, ci }),
  )
  return joinSections([content, footer])
}

const serializeIteration = function ({ row, stats, slow }) {
  const name = row.join(` ${SEPARATOR_SIGN} `)
  const statsStr = serializeStats(stats, slow)
  return `${titleColor(`${name} ${SEPARATOR_SIGN}`)} ${statsStr}`
}

export const serializeStats = function (stats, slow) {
  return STATS.map(({ name, shortName }) =>
    serializeStat({ stats, name, shortName, slow }),
  ).join(` ${separatorColor(SEPARATOR_SIGN)} `)
}

const STATS = [
  { name: 'medianPretty', shortName: 'mdn' },
  { name: 'meanPretty', shortName: 'mea' },
  { name: 'minPretty', shortName: 'min' },
  { name: 'maxPretty', shortName: 'max' },
  { name: 'diffPretty', shortName: 'dif' },
  { name: 'limitPretty', shortName: 'lmt' },
  { name: 'deviationPretty', shortName: 'dev' },
  { name: 'countPretty', shortName: 'cnt' },
  { name: 'loopsPretty', shortName: 'lps' },
  { name: 'repeatPretty', shortName: 'rpt' },
  { name: 'processesPretty', shortName: 'prc' },
]

const serializeStat = function ({ stats, name, shortName, slow }) {
  const stat = stats[name]

  if (name === 'limitPretty' && slow) {
    return errorColor(`${shortName} ${stat}`)
  }

  return `${fieldColor(shortName)} ${stat}`
}

export const debug = { report }
