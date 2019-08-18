import { pointer } from 'figures'
import { cyan } from 'chalk'

import { padTitles } from './titles.js'

// Add:
//  - `iteration.name`: combines task, variation, command and env.
//     For one-dimensional reporters.
//  - `iteration.columnName`: combines variation, command and env.
//     For two-dimensional reporters. `taskTitle` is the row name.
// We need to do this three times:
//  - before benchmarks start because `iteration.name` is used by progress
//    reporters.
//  - after benchmarks end and previous benchmarks merging because those add
//    new iterations
//  - after `diff` has been computed, which has to be after previous benchmarks
//    names have been added
export const addNames = function(iterations) {
  const iterationsA = padTitles(iterations)

  const props = NAME_PROPS.filter(propName =>
    shouldShowProp(propName, iterationsA),
  )
  const propsA = [COLUMN_PROP, ...props]
  return iterationsA.map(iteration => addName(iteration, propsA))
}

const NAME_PROPS = ['variationTitle', 'commandTitle', 'envTitle']

// If all variations/commands/envs are the same, do not include them.
// Do not do this for tasks though, since `name` should not be empty.
const shouldShowProp = function(propName, iterations) {
  const props = iterations.map(iteration => iteration[propName])
  const uniqueProps = [...new Set(props)]
  return uniqueProps.length !== 1
}

const addName = function(iteration, props) {
  const name = getName(iteration, props)
  const columnName = getColumnName(iteration, props)
  return { ...iteration, name, columnName }
}

const getColumnName = function(iteration, props) {
  const propsA = props.filter(isColumnProp)
  const columnName = getName(iteration, propsA)

  if (columnName === '') {
    return
  }

  return columnName
}

const isColumnProp = function(propName) {
  return propName !== COLUMN_PROP
}

const getName = function(iteration, props) {
  return props
    .map(propName => cyan.bold(iteration[propName]))
    .join(`${cyan.dim(pointer)}  `)
}

const COLUMN_PROP = 'taskTitle'
