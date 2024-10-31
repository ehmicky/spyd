#!/usr/bin/env node
import { handleEvents } from '../../common/ipc.js'

import { after, before, measure } from './measure.js'
import { end, start } from './start/main.js'

handleEvents({ start, before, measure, after, end })
