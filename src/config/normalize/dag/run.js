import pProps from 'p-props'

import { mapValues } from '../../../utils/map.js'

import { createDag, addDagEdge } from './structure.js'

// Run several async or async tasks in parallel while still allowing them to
// use each other's return values.
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
//  - Values are async functions which receive an object of promises as single
//    argument
//     - To use functions with more arguments, those must be bound or use
//       lexical scoping
// The return value is a similar `tasks` object but with the functions replaced
// by their return value instead.
export const runDag = async function (tasks) {
  const tasksNames = Object.keys(tasks)
  const dag = createDag(tasksNames)
  const tasksPromises = mapValues(tasks, createTaskPromise)
  const allTasksArgs = mapValues(
    tasks,
    getTasksArgs.bind(undefined, dag, Object.entries(tasksPromises)),
  )
  const tasksReturns = await pProps(tasks, (taskFunc, taskName) =>
    runTask(taskFunc, tasksPromises[taskName], allTasksArgs[taskName]),
  )
  return tasksReturns
}

// Creates one promise to represent each task's state.
// `taskPromise` has a noop error handler to avoid uncaught promise rejection
// process errors in case a task fails but no other task follows it.
// Tasks which do follow it will still receive the rejection correctly.
const createTaskPromise = function () {
  const taskPromise = createPromise()
  // eslint-disable-next-line promise/prefer-await-to-then
  taskPromise.promise.catch(noop)
  return taskPromise
}

// Create a promise which state can be manually manipulated
/* eslint-disable fp/no-let, init-declarations, fp/no-mutation,
   promise/avoid-new */
const createPromise = function () {
  let resolveFunc
  let rejectFunc
  const promise = new Promise((resolve, reject) => {
    resolveFunc = resolve
    rejectFunc = reject
  })
  return { promise, resolve: resolveFunc, reject: rejectFunc }
}
/* eslint-enable fp/no-let, init-declarations, fp/no-mutation,
   promise/avoid-new */

// eslint-disable-next-line no-empty-function
const noop = function () {}

// Each task receive a `tasksArgs` object which is a copy of `tasksPromises`
// except it is wrapped in getters.
// Each sets of getters keeps track of the `parentTaskName` it is associated
// with, which allows knowing which task references which.
// We use getters for convenience.
// eslint-disable-next-line max-params
const getTasksArgs = function (dag, tasksPromisesEntries, _, parentTaskName) {
  const tasksArgs = {}

  // eslint-disable-next-line fp/no-loops
  for (const [childTaskName, taskPromise] of tasksPromisesEntries) {
    setTaskArgGetter({
      dag,
      tasksArgs,
      parentTaskName,
      childTaskName,
      taskPromise,
    })
  }

  return tasksArgs
}

const setTaskArgGetter = function ({
  dag,
  tasksArgs,
  parentTaskName,
  childTaskName,
  taskPromise,
}) {
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(tasksArgs, childTaskName, {
    get: getTaskArg.bind(undefined, {
      dag,
      parentTaskName,
      childTaskName,
      taskPromise,
    }),
    // `tasksArgs` should not be iterated since it would call the getter,
    // including with object spreading.
    enumerable: false,
    // Those values are only intended to be read, not write
    configurable: false,
  })
}

const getTaskArg = function ({
  dag,
  parentTaskName,
  childTaskName,
  taskPromise,
}) {
  addDagEdge(dag, parentTaskName, childTaskName)
  return taskPromise.promise
}

// Run a single task function and resolve|reject its associated promise
const runTask = async function (taskFunc, { resolve, reject }, tasksArgs) {
  try {
    const taskReturn = await taskFunc(tasksArgs)
    resolve(taskReturn)
    return taskReturn
  } catch (error) {
    reject(error)
    throw error
  }
}
