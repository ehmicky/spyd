#!/usr/bin/env node
import { handleEvents } from '../common/ipc.js'

import { before, after } from './hooks.js'
import { measure } from './measure/main.js'
import { start, end } from './start/main.js'

handleEvents({ start, before, measure, after, end })
