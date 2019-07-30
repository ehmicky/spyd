import { benchmark } from './temp.js'
import { sendParentMessage, getParentMessage } from './ipc_helpers.js'

// Child process entry point.
// Wait for the parent process to ask it to benchmark the task then send the
// result back to the parent.
const run = async function() {
  await sendParentMessage('ready')

  const { taskPath, parameter } = await getParentMessage('load')

  const [mainA, beforeA, afterA] = bindParameter(PARAMETERS, parameter, [
    main,
    before,
    after,
  ])

  const duration = await getParentMessage('run')

  const result = await benchmark(mainA, beforeA, afterA, duration)
  await sendParentMessage('result', result)
}

const bindParameter = function(parameters, parameter, funcs) {
  if (parameter === undefined) {
    return funcs
  }

  const parameterValue = parameters[parameter]
  return funcs.map(func => bindFunction(func, parameterValue))
}

const bindFunction = function(func, parameterValue) {
  if (func === undefined) {
    return
  }

  return func.bind(null, parameterValue)
}

const before = undefined

const main = Math.random

const after = undefined

const PARAMETERS = undefined

run()
