const STDOUT_FD = 1
const STDERR_FD = 2
const OUTPUT_FD = 4
const ERROR_OUTPUT_FD = 5

// In `run` we use file descriptor 4 for success output and 5 for error output.
// The reasons we are not using stdout/stderr instead are:
//  - standard streams are likely be used by the benchmarking code
//  - likewise, file descriptor 3 is sometimes (though rarely) used
//  - IPC needs to work across programming languages
// In `debug` we do things differently:
//  - iterations don't use fd4 since there's no benchmarking output
//  - iterations pipe stdout/stderr directly to console
//  - initial load shows stdout/stderr to console but only if an exception was
//    thrown. Otherwise iterations will show it anyway, so no need to repeat it.
export const FDS = {
  run: {
    stdio: ['ignore', 'ignore', 'ignore', 'ignore', 'pipe', 'pipe'],
    outputFd: OUTPUT_FD,
    errorFds: [ERROR_OUTPUT_FD],
  },

  loadDebug: {
    stdio: ['ignore', 'pipe', 'pipe', 'ignore', 'pipe', 'pipe'],
    outputFd: OUTPUT_FD,
    errorFds: [ERROR_OUTPUT_FD, STDERR_FD, STDOUT_FD],
  },

  iterationDebug: {
    stdio: ['ignore', 'inherit', 'inherit', 'ignore', 'ignore', 'pipe'],
    errorFds: [ERROR_OUTPUT_FD],
  },
}
