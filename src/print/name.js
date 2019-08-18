import { pointer } from 'figures'
import { cyan } from 'chalk'

// Add:
//  - `iteration.name`: combines task, variation and command.
//     For one-dimensional reporters.
//  - `iteration.columnName`: combines variation and command.
//     For two-dimensional reporters. `taskTitle` is the row name.
// We need to do this before benchmarks start because `iteration.name` is used
// by progress reporters.
export const addNames = function(iterations) {
  const props = NAME_PROPS.filter(propName =>
    shouldShowProp(iterations, propName),
  )
  const propsA = ['taskTitle', ...props]
  return iterations.map(iteration => addName(iteration, propsA))
}

const NAME_PROPS = ['variationTitle', 'commandTitle']

// If all variations and/or commands are the same, do not report them.
// Do not do this for tasks though, since `name` should not be empty.
const shouldShowProp = function(iterations, propName) {
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
  return propName !== 'taskTitle'
}

const getName = function(iteration, props) {
  return props
    .map(propName => iteration[propName])
    .filter(Boolean)
    .map(part => cyan.bold(part))
    .join(`${cyan.dim(pointer)}  `)
}
