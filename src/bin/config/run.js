import { TASKS, REPORT, HISTORY } from './groups.js'

// Configuration specific to `run`
export const RUN_CONFIG = {
  precision: {
    group: TASKS,
    alias: 'p',
    requiresArg: true,
    describe: `Precision level of the results, between 0 and 10.
The default is 5.
A higher level increases precision but makes the benchmark last longer.`,
  },
  'reporter.quiet': {
    group: REPORT,
    alias: 'q',
    describe: `Preview the results and display a progress bar.
Reporters are still used.
Default: false if the output is an interactive terminal.`,
  },
  save: {
    group: HISTORY,
    describe: `Save the results.
Default: false`,
  },
  merge: {
    group: HISTORY,
    requiresArg: true,
    describe: `Merge this result with a previous one.
The value is the previous result's identifier.
It can be "last" to refer to merge to the last result.
It no previous result with the identifier is found, this sets the new result's
identifier instead. This allows merging several benchmarks running in parallel.
Default: none`,
  },
  outliers: {
    group: TASKS,
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
