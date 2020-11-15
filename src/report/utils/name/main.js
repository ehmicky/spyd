import { padTitles } from './padding.js'

// Add:
//  - `iteration.task|input|command|systemTitlePadded`: like `iteration.*Title`
//     but padded so all iterations vertically align
//  - `iteration.row`: combines task, input, command and system.
//     For one-dimensional reporters.
//  - `iteration.column`: combines input, command and system.
//     For two-dimensional reporters. `taskTitlePadded` is the row name.
// We need to do this three times:
//  - before benchmarks start because `iteration.name` is used by progress
//    reporters.
//  - after benchmarks end and previous benchmarks merging because those add
//    new iterations
//  - after `diff` has been computed, which has to be after previous benchmarks
//    names have been added
export const addNames = function (iterations) {
  const iterationsA = padTitles(iterations)
  const iterationsB = addTitlesProps(iterationsA, 'column', COLUMN_PROPS)
  const iterationsC = addTitlesProps(iterationsB, 'row', ROW_PROPS)
  return iterationsC
}

const COLUMN_PROPS = [
  'inputTitlePadded',
  'commandTitlePadded',
  'systemTitlePadded',
]
const ROW_PROPS = ['taskTitlePadded', ...COLUMN_PROPS]

const addTitlesProps = function (iterations, name, propNames) {
  const propNamesA = propNames.filter((propName) =>
    shouldShowProp(propName, iterations),
  )
  return iterations.map((iteration) =>
    addTitlesProp(iteration, name, propNamesA),
  )
}

// Inputs/systems are not shown is always empty.
const shouldShowProp = function (propName, iterations) {
  return iterations.some((iteration) => iteration[propName] !== '')
}

const addTitlesProp = function (iteration, name, propNames) {
  const paddedTitles = propNames.map((propName) => iteration[propName])
  return { ...iteration, [name]: paddedTitles }
}
