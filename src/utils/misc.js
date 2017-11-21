export const onStdinMatch = (pattern, cb) =>
  process.stdin.on(
    'data',
    text =>
      text
        .toString()
        .trim()
        .match(pattern) && cb(),
  )

export const log = console.log // eslint-disable-line no-console

export const createChainedObject = obj =>
  Object.keys(obj).reduce((chained, key) => {
    const member = obj[key]
    if (typeof member === 'function') {
      chained[key] = (...args) => {
        const res = member(...args)
        return res !== undefined ? res : chained
      }
    } else {
      chained[key] = obj[key]
    }

    return chained
  }, {})
