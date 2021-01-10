import { padTitles } from './padding.js'

// Add:
//  - `combination.task|runner|systemTitlePadded`: like
//     `combination.*Title` but padded so all combinations vertically align
//  - `combination.row`: combines task, runner and system.
//     For one-dimensional reporters.
//  - `combination.column`: combines runner and system.
//     For two-dimensional reporters. `taskTitlePadded` is the row name.
// We need to do this three times:
//  - before measuring start because `combination.name` is used by progress
//    reporters.
//  - after measuring ends and previous results merging because those add
//    new combinations
//  - after `diff` has been computed, which has to be after previous results
//    names have been added
export const addTitles = function (combinations) {
  const combinationsA = padTitles(combinations)
  const combinationsB = addTitlesProps(combinationsA, 'column', COLUMN_PROPS)
  const combinationsC = addTitlesProps(combinationsB, 'row', ROW_PROPS)
  return combinationsC
}

const COLUMN_PROPS = ['runnerTitlePadded', 'systemTitlePadded']
const ROW_PROPS = ['taskTitlePadded', ...COLUMN_PROPS]

const addTitlesProps = function (combinations, name, propNames) {
  const propNamesA = propNames.filter((propName) =>
    shouldShowProp(propName, combinations),
  )
  return combinations.map((combination) =>
    addTitlesProp(combination, name, propNamesA),
  )
}

// Inputs/systems are not shown is always empty.
const shouldShowProp = function (propName, combinations) {
  return combinations.some((combination) => combination[propName] !== '')
}

const addTitlesProp = function (combination, name, propNames) {
  const paddedTitles = propNames.map((propName) => combination[propName])
  return { ...combination, [name]: paddedTitles }
}
