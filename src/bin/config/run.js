import { TASKS, REPORT, HISTORY } from './groups.js'

// Configuration specific to `run`
export const RUN_CONFIG = {
  precision: {
    group: TASKS,
    alias: 'p',
    number: true,
    requiresArg: true,
    describe: `Precision level of the results, between 0 and 4.
The default is 2.
A higher level increases precision but makes the benchmark last longer.`,
  },
  quiet: {
    group: REPORT,
    alias: 'q',
    boolean: true,
    describe: `Preview the results and display a progress bar.
Reporters are still used.
Default: false if the output is an interactive terminal.`,
  },
  save: {
    group: HISTORY,
    boolean: true,
    describe: `Save the results.
Default: false`,
  },
  limit: {
    group: HISTORY,
    alias: 'l',
    string: true,
    describe: `Report when the average duration has increased by more than a
specific percentage such as "50%".

Negative percentages like "-50%" can be used for decreases instead.

The limit can be scoped to specific combinations by appending their identifiers
after the percentage.
  - The syntax is the same as the "select" configuration property.
  - For example "50% taskOne and node" applies only to taskOne when the runner
    is node.
  - Several limits can be specified at once.`,
  },
}
