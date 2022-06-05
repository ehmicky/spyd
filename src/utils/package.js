import { createRequire } from 'module'

// TODO: replace with a JSON import after dropping support for Node <16.14.0
export const packageJson = createRequire(import.meta.url)(
  '../../../package.json',
)
