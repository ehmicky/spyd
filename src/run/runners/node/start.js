#!/usr/bin/env node
import { startRunner } from '../common/ipc.js'

import { benchmark } from './benchmark/main.js'
import { load } from './load/main.js'

startRunner({ load, benchmark })
