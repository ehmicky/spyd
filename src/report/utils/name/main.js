import { pointer } from 'figures'

import { titleColor, separatorColor } from '../colors.js'

import { padTitles } from './padding.js'

// Add:
//  - `iteration.task|input|command|systemTitlePadded`: like `iteration.*Title`
//     but padded so all iterations vertically align
//  - `iteration.name`: combines task, input, command and system.
//     For one-dimensional reporters.
//  - `iteration.columnName`: combines input, command and system.
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
  const iterationsB = addNameProps(iterationsA, 'name', NAME_PROPS)
  const iterationsC = addNameProps(iterationsB, 'columnName', COLUMN_PROPS)
  return iterationsC
}

const COLUMN_PROPS = [
  'inputTitlePadded',
  'commandTitlePadded',
  'systemTitlePadded',
]
const NAME_PROPS = ['taskTitlePadded', ...COLUMN_PROPS]

const addNameProps = function (iterations, name, propNames) {
  const propNamesA = propNames.filter((propName) =>
    shouldShowProp(propName, iterations),
  )
  return iterations.map((iteration) => addNameProp(iteration, name, propNamesA))
}

// Inputs/systems are not shown is always empty.
const shouldShowProp = function (propName, iterations) {
  return iterations.some((iteration) => iteration[propName] !== '')
}

const addNameProp = function (iteration, name, propNames) {
  const value = getName(iteration, propNames)
  return { ...iteration, [name]: value }
}

const getName = function (iteration, propNames) {
  return propNames
    .map((propName) => titleColor(iteration[propName]))
    .join(`${separatorColor(titleColor(pointer))}  `)
}
