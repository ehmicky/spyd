import { TASKS, REPORT, HISTORY } from './groups.js'

// Configuration specific to `run`
export const RUN_CONFIG = {
  precision: {
    group: TASKS,
    alias: 'p',
    number: true,
    requiresArg: true,
    describe: `Precision level of the results, between 0 and 10.
The default is 5.
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

"0%" can be used to report any increase.
Negative percentages like "-50%" can be used for decreases instead.

The limit can be scoped to specific combinations by appending their identifiers
after the percentage.
  - The syntax is the same as the "select" configuration property.
  - For example "50% taskOne and node" applies only to taskOne when the runner
    is node.
  - Several limits can be specified at once.`,
  },
  outliers: {
    group: TASKS,
    boolean: true,
    describe: `Some measures can be extremely slower than others.
Most of the times, those outliers are due to concurrent logic unrelated to
your tasks such as garbage collection or OS background processes.

Outliers lower accuracy and significantly slow down benchmarks.
Therefore, they are ignored by default.
They can be kept by setting this configuration property to "true" instead.

We recommend keeping the default behavior unless you are confident those
measures are important for the benchmark's results.

Default: false`,
  },
}
