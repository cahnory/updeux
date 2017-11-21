import fs from 'fs'
import {
  WATCHER_ALREADY_WATCHING_ERROR,
  WATCHER_ALREADY_STOPPED_ERROR,
} from './constants'

export default (options = {}) => {
  let fsWatcher
  let { onChange, debounceDelay = 100 } = options

  if (debounceDelay) {
    onChange = debounce(onChange, debounceDelay)
  }

  const watcher = {
    start: () => {
      if (fsWatcher) {
        throw new Error(WATCHER_ALREADY_WATCHING_ERROR)
      }
      fsWatcher = watch(options.path, onChange)
      return watcher
    },
    stop: () => {
      if (!fsWatcher) {
        throw new Error(WATCHER_ALREADY_STOPPED_ERROR)
      }
      fsWatcher.close()
      fsWatcher = null
      return watcher
    },
    isWatching: () => !!fsWatcher,
  }

  return watcher
}

const watch = (path, callback) =>
  fs.watch(path, { recursive: true }, (event, filename) => {
    if (event === 'rename') {
      callback(
        fs.existsSync(`${path}/${filename}`) ? 'create' : 'delete',
        filename,
      )
    } else {
      callback('update', filename)
    }
  })

export const debounce = (cb, delay) => {
  let pending

  return (...args) => {
    if (pending) {
      clearTimeout(pending)
    }
    pending = setTimeout(() => cb(...args), delay)
  }
}
