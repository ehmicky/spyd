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
//  - This is done by passing to each task an object with promises resolving
//    to all other tasks' return values
// Cycles are validated and throw exceptions.
// The `tasks` object:
//  - Is unordered
//  - Keys are used by tasks to reference each other
//  - Values are functions which receive an object as single argument
//     - The object keys are the other task keys
//     - The object values are the other task return values
//     - To use functions with more arguments, those must be bound or use
//       lexical scoping
// The return value is a similar `tasks` object but with the functions replaced
// by their return values instead.
export const runDag = function (tasks) {
  const tasksNames = Object.keys(tasks)
  const dag = createDag(tasksNames)
  const boundTasks = getBoundTasks(tasks, tasksNames, dag)
  const tasksReturns = mapValues(boundTasks, runBoundTaskFunc)
  return tasksReturns
}

// Since each boundTask references each other, we need to create a `boundTasks`
// reference first, bind each `taskFunc`, then update that reference.
const getBoundTasks = function (tasks, tasksNames, dag) {
  const boundTasks = mapValues(tasks, noop)
  const boundTasksValues = mapValues(tasks, (taskFunc, parentTaskName) =>
    bindTaskFunc({
      dag,
      boundTasks,
      tasksNames,
      parentTaskName,
      taskFunc,
    }),
  )
  // eslint-disable-next-line fp/no-mutating-assign
  return Object.assign(boundTasks, boundTasksValues)
}

// eslint-disable-next-line no-empty-function
const noop = function () {}

// Each `taskFunc` is being bound with a `tasksArg` object.
// That object has methods to call the other `taskFuncs`.
// We need to memoize each `taskFunc` since references mean they would be
// called several times.
const bindTaskFunc = function ({
  dag,
  boundTasks,
  tasksNames,
  parentTaskName,
  taskFunc,
}) {
  const boundTaskFunc = memoizeOne(taskFunc)
  const tasksArg = getTasksArg({
    dag,
    boundTasks,
    tasksNames,
    parentTaskName,
  })
  return boundTaskFunc.bind(undefined, tasksArg)
}

const getTasksArg = function ({ dag, boundTasks, tasksNames, parentTaskName }) {
  const tasksArgs = {}

  // eslint-disable-next-line fp/no-loops
  for (const childTaskName of tasksNames) {
    setTaskArgGetter({
      dag,
      tasksArgs,
      parentTaskName,
      childTaskName,
      boundTasks,
    })
  }

  return tasksArgs
}

// We use getters to simplify how `tasksArg` is consumed.
const setTaskArgGetter = function ({
  dag,
  tasksArgs,
  parentTaskName,
  childTaskName,
  boundTasks,
}) {
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(tasksArgs, childTaskName, {
    get: getTaskArg.bind(undefined, {
      dag,
      parentTaskName,
      childTaskName,
      boundTasks,
    }),
    // `tasksArgs` should not be iterated since it would call the getter,
    // including with object spreading.
    enumerable: false,
    // Those values are only intended to be read, not write
    configurable: false,
  })
}

// Each `tasksArgs` method just forward to another `taskFunc` but it also
// validate against cycles.
// It does so by keeping track of the `parentTaskName` it is associated with.
const getTaskArg = function ({
  dag,
  parentTaskName,
  childTaskName,
  boundTasks,
}) {
  addDagEdge(dag, parentTaskName, childTaskName)
  return boundTasks[childTaskName]()
}

const runBoundTaskFunc = function (boundTaskFunc) {
  return boundTaskFunc()
}
