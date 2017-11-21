import createWatcher from '../watcher'
import { exec } from 'child_process'
import { loadOptions, didOptionsUpdate } from '../utils/options'
import { log } from '../utils/misc'

let options = loadOptions()
let watcher

const isWatching = () => watcher && watcher.isWatching()

export const work = () => {
  if (options.cmd) {
    exec(options.cmd, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        return console.error(error) // eslint-disable-line no-console
      }
      if (stderr) {
        return console.error(stderr) // eslint-disable-line no-console
      }
      if (stdout) {
        return console.log(stdout) // eslint-disable-line no-console
      }
    })
  } else {
    try {
      options.require.forEach(require)
      require(options.srcFile)
    } catch (error) {
      return console.error(error) // eslint-disable-line no-console
    }
  }
}

export const start = master => {
  if (master.status().started) {
    return log('updeux is already started')
  }
  config(master)
  master.start()
}

export const stop = master => {
  if (!master.status().started) {
    return log('updeux is already stopped')
  }

  if (isWatching()) {
    watcher.stop()
  }

  master.stop()
}

export const update = master => {
  log('updeux updates')
  master.update()
}

export const reset = master => {
  log('updeux resets')
  const newOptions = loadOptions()
  if (didOptionsUpdate(options, newOptions)) {
    options = newOptions
    config(master)
  } else {
    master.update()
  }
}

export const config = master => {
  const {
    maxWorker,
    maxFailuresByUpdate,
    shutdownDelay,
    keepFresh,
    keepSync,
    watchDebounce,
  } = options

  // master
  master.settings({
    maxWorker,
    maxFailuresByUpdate,
    shutdownDelay,
  })

  // watcher
  if (isWatching()) {
    watcher.stop()
  }

  if (options.srcDir && (keepFresh || keepSync)) {
    watcher = createWatcher({
      path: options.srcDir,
      debounce: watchDebounce,
      onChange: () => {
        if (keepFresh) {
          master.update(master)
        }
      },
    })
    watcher.start()
  }
}
