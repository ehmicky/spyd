import process from 'process'

import execa from 'execa'

import { applyTemplate } from './template.js'

// Spawn a process and retrieve its output.
// Errors are propagated.
// Stdout/stderr is handled differently depending on the command:
//  - The `stdout` of `variables` and `before` is used as template variables,
//    so it is piped. This is not the case of `main` and `after`.
//  - The `stdout` and `stderr` of all commands is inherited so it's shown in
//    `debug`, except for variables since that might be too confusing.
// `pipeInherit` is a mechanism to combine `pipe` and `inherit` when `stdout`
// should be both returned and streamed.
export const spawnProcess = async function (
  command,
  { variables, shell, stdout, stderr },
) {
  const execaFunc = shell ? execa : execa.command
  const commandA = applyTemplate(command, variables).trim()
  const stdio = getStdio(stdout, stderr)
  const { stdout: stdoutOutput } = await execaFunc(commandA, {
    stdio,
    shell,
    preferLocal: true,
  })

  if (stdout === 'pipeInherit' && stdoutOutput.trim() !== '') {
    process.stdout.write(`${stdoutOutput}\n`)
  }

  return stdoutOutput
}

const getStdio = function (stdout, stderr) {
  const stdoutA = stdout === 'pipeInherit' ? 'pipe' : stdout
  return ['ignore', stdoutA, stderr]
}
