import { validateString } from '../../config/normalize/validate.js'

export { launch } from './launch/main.js'

export const config = [{ name: 'version', validate: validateString }]
