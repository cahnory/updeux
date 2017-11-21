#!/usr/bin/env node
import master from '../master'
import worker from '../worker'
import { start, stop, update, reset, work } from './actions'
import logger from './logger'
import { onStdinMatch } from '../utils/misc'

worker.use(work).init()

master
  .use(logger.master)
  .use(master => {
    onStdinMatch('start', () => start(master))
    onStdinMatch('stop', () => stop(master))
    onStdinMatch('update', () => update(master))
    onStdinMatch('reset', () => reset(master))
    onStdinMatch('status', () =>
      process.stdout.write(JSON.stringify(master.status(), null, 2)),
    )

    start(master)
  })
  .init()
