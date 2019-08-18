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

// If all commands are the same, do not include them.
// Tasks/variations/envs should always be shown though, unless always empty.
const shouldShowProp = function(propName, iterations) {
  const props = iterations.map(iteration => iteration[propName])
  const uniqueProps = [...new Set(props)]

  return (
    uniqueProps.length !== 1 ||
    (propName !== 'commandTitle' && uniqueProps[0].trim() !== '')
  )
}

const addName = function(iteration, props) {
  const name = getName(iteration, props)
  const columnName = getName(iteration, props.filter(isColumnProp))
  return { ...iteration, name, columnName }
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
