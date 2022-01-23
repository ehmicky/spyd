import memoizeOne from 'memoize-one'
import pProps from 'p-props'

import { mapValues } from '../../../utils/map.js'

import { createDag, addDagEdge } from './structure.js'

// Same as `runDag()` but allows methods to be async, or a mixed of sync|async.
export const runDagAsync = async function (tasks) {
  const tasksReturns = runDag(tasks)
  return await pProps(tasksReturns)
}

// Run several tasks in parallel while still allowing them to use each other's
// return values.
// This creates a DAG.
//  - Unlike traditional DAGs which require each task to declaring its
//    dependencies as a static array, tasks declare those in an imperative
//    fashion, by referencing the other task's return value
//  - This is simpler and more intuitive.
//  - This is done by passing to each task a function to retrieve other tasks'
//    return values
// Cycles are validated and throw exceptions.
// The `tasks` object:
//  - Is unordered
//  - Keys are used by tasks to reference each other
//  - Values are functions which receive an object as single function argument
//     - Its parameter is the other task's key
//     - The return value is the other task's return value
//     - To use functions with more arguments, those must be bound or use
//       lexical scoping
// The return value is a similar `tasks` object but with the functions replaced
// by their return values instead.
export const runDag = function (tasks) {
  const tasksNames = Object.keys(tasks)
  const dag = createDag(tasksNames)
  const boundTasks = getBoundTasks(tasks, dag)
  const tasksReturns = mapValues(boundTasks, runBoundTaskFunc)
  return tasksReturns
}

// Since each boundTask references each other, we need to create a `boundTasks`
// reference first, bind each `taskFunc`, then update that reference.
const getBoundTasks = function (tasks, dag) {
  const boundTasks = mapValues(tasks, noop)
  const boundTasksValues = mapValues(tasks, (taskFunc, parentTaskName) =>
    bindTaskFunc({
      dag,
      boundTasks,
      parentTaskName,
      taskFunc,
    }),
  )
  // eslint-disable-next-line fp/no-mutating-assign
  return Object.assign(boundTasks, boundTasksValues)
}

// eslint-disable-next-line no-empty-function
const noop = function () {}

// We need to memoize each function since references mean they would be called
// several times.
const bindTaskFunc = function ({ dag, boundTasks, parentTaskName, taskFunc }) {
  const memoizedTask = memoizeOne(taskFunc)
  const boundRunOtherTask = runOtherTask.bind(undefined, {
    dag,
    boundTasks,
    parentTaskName,
  })
  return memoizedTask.bind(undefined, boundRunOtherTask)
}

// Each `tasksArgs` method just forward to another `taskFunc` but it also
// validate against cycles.
// It does so by keeping track of the `parentTaskName` it is associated with.
const runOtherTask = function (
  { dag, boundTasks, parentTaskName },
  childTaskName,
) {
  addDagEdge(dag, parentTaskName, childTaskName)
  return boundTasks[childTaskName]()
}

const runBoundTaskFunc = function (boundTaskFunc) {
  return boundTaskFunc()
}
