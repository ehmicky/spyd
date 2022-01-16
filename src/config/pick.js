import filterObj from 'filter-obj'

// All config properties can be specified in `spyd.yml` (unlike CLI flags), for
// any commands.
// Therefore, we need to filter them out depending on the current command.
export const pickCommandConfig = function (config, command) {
  return filterObj(config, (name) => shouldKeepProp(name, command))
}

const shouldKeepProp = function (name, command) {
  return COMMAND_GROUPS[CONFIG_PROPS[name]].includes(command)
}

// Every configuration property and which command can use it
const CONFIG_PROPS = {
  colors: 'report',
  config: 'all',
  cwd: 'all',
  delta: 'delta',
  force: 'remove',
  inputs: 'combinations',
  limit: 'report',
  merge: 'run',
  output: 'report',
  outliers: 'run',
  precision: 'run',
  quiet: 'run',
  reporter: 'report',
  reporterConfig: 'report',
  runner: 'combinations',
  runnerConfig: 'combinations',
  save: 'run',
  select: 'select',
  showDiff: 'report',
  showMetadata: 'report',
  showPrecision: 'report',
  showSystem: 'report',
  showTitles: 'report',
  since: 'history',
  system: 'combinations',
  tasks: 'combinations',
  titles: 'report',
}

// Every group of commands
const COMMAND_GROUPS = {
  // All commands
  all: ['dev', 'remove', 'run', 'show'],
  // Commands that can run combinations
  combinations: ['dev', 'run'],
  // Commands that use main deltas
  delta: ['remove', 'show'],
  // Commands that use history
  history: ['remove', 'run', 'show'],
  // `remove` command
  remove: ['remove'],
  // Commands that report results
  report: ['remove', 'run', 'show'],
  // `run` command
  run: ['run'],
  // Commands that can select combinations
  select: ['dev', 'remove', 'run', 'show'],
}
