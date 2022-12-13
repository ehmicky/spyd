import { hasSameCombinationIds } from '../../../combination/result.js'
import { fieldColor } from '../../utils/colors.js'
import { getCombinationTitleColor } from '../../utils/combination_title.js'
import { STATS_SEPARATOR_COLORED } from '../../utils/separator.js'
import { getTables } from '../../utils/table/main.js'

// Show `result.history` as a table
export const reportTerminal = ({ combinations, history, screenWidth }) => {
  const headerRows = getHeaderRows(history)
  const bodyRows = getBodyRows(combinations, history)
  return getTables([...headerRows, ...bodyRows], screenWidth)
}

const getHeaderRows = (history) => {
  const timestamps = history.map(getTimestamp)
  return [
    ['', ...timestamps.map(getResultDay)],
    ['', ...timestamps.map(getResultTime)],
    [],
  ]
}

const getTimestamp = ({ timestamp }) => timestamp.split(' ')

const getResultDay = ([day]) => fieldColor(day)

const getResultTime = ([, ...time]) => fieldColor(time.join(' '))

const getBodyRows = (combinations, history) =>
  combinations.map((combination) => getBodyRow(combination, history))

const getBodyRow = (combination, history) => {
  const leftCell = getCombinationTitleColor(combination)
  const rightCells = history.map((historyResult) =>
    getCell(historyResult, combination),
  )
  return [leftCell, ...rightCells]
}

const getCell = (historyResult, combination) => {
  const historyCombinationA = historyResult.combinations.find(
    (historyCombination) =>
      hasSameCombinationIds(historyCombination, combination),
  )

  if (historyCombinationA === undefined) {
    return ''
  }

  const {
    stats: { mean, meanMin, meanMax },
  } = historyCombinationA

  if (meanMin !== undefined) {
    return `${meanMin.prettyColor}${STATS_SEPARATOR_COLORED}${meanMax.prettyColor}`
  }

  if (mean !== undefined) {
    return mean.prettyColor
  }

  return ''
}
