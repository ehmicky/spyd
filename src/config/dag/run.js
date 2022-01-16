import pProps from 'p-props'

import { mapValues } from '../../utils/map.js'

import { createDag, addDagEdge } from './structure.js'

// Run several async tasks in parallel while still allowing them to use each
// other's return values.
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
    getTasksArgs.bind(undefined, dag, tasksPromises),
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
  taskPromise.catch(noop)
  return taskPromise
}

// Create a promise which state can be manually manipulated
/* eslint-disable fp/no-let, init-declarations, fp/no-mutation,
   fp/no-mutating-assign, promise/avoid-new */
const createPromise = function () {
  let resolveFunc
  let rejectFunc
  const promise = new Promise((resolve, reject) => {
    resolveFunc = resolve
    rejectFunc = reject
  })
  Object.assign(promise, { resolve: resolveFunc, reject: rejectFunc })
  return promise
}
/* eslint-enable fp/no-let, init-declarations, fp/no-mutation,
   fp/no-mutating-assign, promise/avoid-new */

// eslint-disable-next-line no-empty-function
const noop = function () {}

// Each task receive a `tasksArgs` object which is a copy of `tasksPromises`
// except it is wrapped in proxies.
// Each sets of proxies keeps track of the `parentTaskName` it is associated
// with, which allows knowing which task references which.
// eslint-disable-next-line max-params
const getTasksArgs = function (dag, tasksPromises, _, parentTaskName) {
  return mapValues(
    tasksPromises,
    getTaskArg.bind(undefined, { dag, parentTaskName }),
  )
}

const getTaskArg = function (
  { dag, parentTaskName },
  taskPromise,
  childTaskName,
) {
  // eslint-disable-next-line fp/no-proxy
  return new Proxy(taskPromise, {
    get: proxyTaskArgMethod.bind(undefined, {
      dag,
      parentTaskName,
      childTaskName,
    }),
  })
}

// Proxies `Promise.then|catch|finally()` so that when a task is using another
// one's return value, we ensure there are no cycles.
// eslint-disable-next-line max-params
const proxyTaskArgMethod = function (
  { dag, parentTaskName, childTaskName },
  taskArg,
  propName,
  receiver,
) {
  const propValue = taskArg[propName]

  if (!isPromiseFollowMethod(propName, propValue)) {
    return Reflect.get(taskArg, propName, receiver)
  }

  addDagEdge(dag, parentTaskName, childTaskName)
  return propValue.bind(taskArg)
}

// We only proxy the methods which need to be
const isPromiseFollowMethod = function (propName, propValue) {
  return typeof propValue === 'function' && PROMISE_FOLLOW_METHODS.has(propName)
}

const PROMISE_FOLLOW_METHODS = new Set(['then', 'catch', 'finally'])

// Run a single task function and resolve|reject its associated promise
const runTask = async function (taskFunc, taskPromise, tasksArgs) {
  try {
    const taskReturn = await taskFunc(tasksArgs)
    taskPromise.resolve(taskReturn)
    return taskReturn
  } catch (error) {
    taskPromise.reject(error)
    throw error
  }
}
