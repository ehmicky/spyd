import { SELECT } from './groups.js'

// Configuration shared by commands that can select combinations:
// `bench`, `exec`, `show`
export const SELECT_CONFIG = {
  include: {
    group: SELECT,
    alias: 'n',
    string: true,
    array: true,
    requiresArg: true,
    describe: `Select only specific combinations.
The value is a list of identifiers to select.
Those can be the identifiers of any task, runner, system or variation.

Identifiers from the same category must be separated by commas.
The others must be separated by spaces.
For example:
  --include="taskOne,taskTwo runnerOne,runnerThree"
selects any combinations from:
  (taskOne or taskTwo) and (runnerOne or runnerThree)

It is possible to invert a whole category using an exclamation mark.
For example:
  --include="taskOne,taskTwo !runnerOne,runnerThree"
selects any combinations from:
  (taskOne or taskTwo) and not (runnerOne or runnerThree)

It is possible to set alternatives by specifying the configuration property
several times.
For example:
  --include=taskOne --include=runnerOne
selects any combinations from:
  either taskOne or runnerOne

By default, all combinations are included.`,
  },
  exclude: {
    group: SELECT,
    alias: 'x',
    string: true,
    array: true,
    requiresArg: true,
    describe: `Exclude specific combinations.
The syntax is the same as the "include" configuration property.
"exclude" has priority over "include".
By default, no combinations are excluded.`,
  },
}
