import { getCommandDescription } from './description.js'

// Runners can spawn multiple commands, specified as `commands`
export const getCommands = function({
  runnerId,
  runnerTitle,
  runOpt,
  commands,
}) {
  return Promise.all(
    commands.map(({ id, title, spawn, spawnOptions, versions }) =>
      getCommand({
        runnerId,
        runnerTitle,
        runOpt,
        id,
        title,
        spawn,
        spawnOptions,
        versions,
      }),
    ),
  )
}

const getCommand = async function({
  runnerId,
  runnerTitle,
  runOpt,
  id,
  title,
  spawn,
  spawnOptions = {},
  versions,
}) {
  const commandId = id === undefined ? runnerId : `${runnerId}_${id}`
  const commandTitle =
    title === undefined ? runnerTitle : `${runnerTitle} ${title}`
  const commandDescription = await getCommandDescription({
    commandTitle,
    versions,
    runnerId,
  })
  return {
    commandRunner: runnerId,
    commandId,
    commandTitle,
    commandDescription,
    commandSpawn: spawn,
    commandSpawnOptions: spawnOptions,
    commandOpt: runOpt,
  }
}
