import { execa, execaCommand } from 'execa'
import now from 'precise-now'

import { wrapError } from '../../../error/wrap.js'
import { TasksRunError } from '../../common/error.js'

// `beforeAll` and `afterAll`
export const before = async function ({ task: { beforeAll }, env, shell }) {
  await performHook(beforeAll, { env, shell })
}

export const after = async function ({ task: { afterAll }, env, shell }) {
  await performHook(afterAll, { env, shell })
}

// Measure how long a task takes.
export const measure = async function (
  { task: { main, beforeEach, afterEach }, env, shell },
  { repeat, maxLoops },
) {
  const measures = new Array(maxLoops)

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index < measures.length; index += 1) {
    // eslint-disable-next-line fp/no-mutation, no-await-in-loop
    measures[index] = await performLoop({
      main,
      beforeEach,
      afterEach,
      env,
      shell,
      repeat,
    })
  }

  return { measures }
}

const performLoop = async function ({
  main,
  beforeEach,
  afterEach,
  env,
  shell,
  repeat,
}) {
  await performHook(beforeEach, { repeat, env, shell })
  const duration = await getDuration(main, { repeat, env, shell })
  await performHook(afterEach, { repeat, env, shell })
  return duration
}

// Checking `repeat === 0` is only needed as a performance optimization
const performHook = async function (hook, { repeat, env, shell }) {
  if (hook === undefined || repeat === 0) {
    return
  }

  await spawnProcesses(hook, { repeat, env, shell })
}

const getDuration = async function (main, { repeat, env, shell }) {
  const start = now()
  await spawnProcesses(main, { repeat, env, shell })
  return now() - start
}

const spawnProcesses = async function (command, { repeat, env, shell }) {
  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = 0; index < repeat; index += 1) {
    // eslint-disable-next-line no-await-in-loop
    await spawnProcess(command, { env, shell })
  }
}

// Spawn a process.
// Errors are propagated.
// Stdout/stderr are always printed since I/O impacts performance, which we
// want to capture. Also this is needed for the `dev` command.
// Steps can communicate to each other using the filesystem.
// Inputs are passed as environment variables.
// More advanced logic can be achieved by either:
//  - Using shell features (subshells, variables, etc.)
//  - Adding the logic to the command internal logic
const spawnProcess = async function (command, { env, shell }) {
  try {
    return shell === 'none'
      ? await execaCommand(command, { ...EXECA_OPTIONS, env })
      : await execa(command, { ...EXECA_OPTIONS, env, shell })
  } catch (error) {
    throw wrapError(error, '', TasksRunError)
  }
}

const EXECA_OPTIONS = {
  stdio: ['ignore', 'inherit', 'inherit'],
  preferLocal: true,
}
