import execa from 'execa'
import now from 'precise-now'

// `beforeAll` and `afterAll`
export const before = async function ({ task: { beforeAll }, env, shell }) {
  await performHook(beforeAll, { env, shell })
}

export const after = async function ({ task: { afterAll }, env, shell }) {
  await performHook(afterAll, { env, shell })
}

// Measure how long a task takes.
export const measure = async function (
  { maxLoops },
  { task: { main, beforeEach, afterEach }, env, shell },
) {
  const measures = []

  // eslint-disable-next-line fp/no-loops
  while (measures.length < maxLoops) {
    // eslint-disable-next-line no-await-in-loop
    await performLoop({ main, beforeEach, afterEach, env, shell, measures })
  }

  return { measures }
}

const performLoop = async function ({
  main,
  beforeEach,
  afterEach,
  env,
  shell,
  measures,
}) {
  await performHook(beforeEach, { env, shell })
  // eslint-disable-next-line fp/no-mutating-methods
  measures.push(await getDuration(main, { env, shell }))
  await performHook(afterEach, { env, shell })
}

const performHook = async function (hook, { env, shell }) {
  if (hook === undefined) {
    return
  }

  await spawnProcess(hook, { env, shell })
}

const getDuration = async function (main, { env, shell }) {
  const start = now()
  await spawnProcess(main, { env, shell })
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
const spawnProcess = async function (command, { env, shell }) {
  if (shell === 'none') {
    return await execa.command(command, { ...EXECA_OPTIONS, env })
  }

  await execa(command, { ...EXECA_OPTIONS, env, shell })
}

const EXECA_OPTIONS = {
  stdio: ['ignore', 'inherit', 'inherit'],
  preferLocal: true,
}
