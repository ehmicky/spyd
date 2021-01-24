import execa from 'execa'
import now from 'precise-now'

// `beforeAll` and `afterAll`
export const before = async function ({ task: { beforeAll }, env }) {
  await performHook(beforeAll, env)
}

export const after = async function ({ task: { afterAll }, env }) {
  await performHook(afterAll, env)
}

// Measure how long a task takes.
export const measure = async function (
  { maxLoops },
  { task: { main, beforeEach, afterEach }, env },
) {
  const measures = []

  // eslint-disable-next-line fp/no-loops
  while (measures.length < maxLoops) {
    // eslint-disable-next-line no-await-in-loop
    await performLoop({ main, beforeEach, afterEach, env, measures })
  }

  return { measures }
}

const performLoop = async function ({
  main,
  beforeEach,
  afterEach,
  env,
  measures,
}) {
  await performHook(beforeEach, env)
  // eslint-disable-next-line fp/no-mutating-methods
  measures.push(await getDuration(main, env))
  await performHook(afterEach, env)
}

const performHook = async function (hook, env) {
  if (hook === undefined) {
    return
  }

  await spawnProcess(hook, env)
}

const getDuration = async function (main, env) {
  const start = now()
  await spawnProcess(main, env)
  return now() - start
}

// Spawn a process.
// Errors are propagated.
// Stdout/stderr are always printed since I/O impacts performance, which we
// want to capture. Also this is needed for the `exec` command.
// Steps can communicate to each other using the filesystem.
// Inputs are passed as environment variables.
// More advanced logic can be achieved by either:
//  - Using shell features (subshells, variables, etc.)
//  - Adding the logic to the command internal logic
const spawnProcess = async function (command, env) {
  await execa.command(command, {
    stdio: ['ignore', 'inherit', 'inherit'],
    env,
    preferLocal: true,
  })
}
