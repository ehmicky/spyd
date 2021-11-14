import { execa } from 'execa'

// Spawn a child process
// We use `preferLocal: true` so that locally installed binaries can be used.
export const spawnProcess = function ([file, ...args], execaOpts, cwd) {
  return execa(file, args, { ...execaOpts, cwd, preferLocal: true })
}
