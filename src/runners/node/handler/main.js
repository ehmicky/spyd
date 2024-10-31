#!/usr/bin/env node
import { handleEvents } from '../../common/ipc.js'

import { after, before } from './hooks.js'
import { measure } from './measure/main.js'
import { end, start } from './start/main.js'

handleEvents({ start, before, measure, after, end })
