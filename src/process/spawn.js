import execa from 'execa'

// Spawn a child process
export const spawnProcess = function ([file, ...args], execaOpts, cwd) {
  return execa(file, args, { ...execaOpts, cwd, preferLocal: true })
}
