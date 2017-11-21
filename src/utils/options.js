import fs from 'fs'
import path from 'path'

import { DEFAULT_OPTIONS, OPTION_KEYS } from '../constants'

const RC_PATH = './.updeuxrc'
const PKG_PATH = './package.json'

export const loadOptions = () => {
  let options

  // input values
  if (fs.existsSync(RC_PATH)) {
    options = JSON.parse(fs.readFileSync(RC_PATH, 'utf-8'))
  } else if (fs.existsSync(PKG_PATH)) {
    options = JSON.parse(fs.readFileSync(RC_PATH, 'utf-8')).updeux || {}
  } else {
    options = {}
  }

  // default values
  options = { ...DEFAULT_OPTIONS, ...options, isFile: false }

  // derivated values
  if (options.src && fs.existsSync(options.src)) {
    options.isFile =
      fs.existsSync(options.src) && fs.statSync(options.src).isFile()
    const src = fs.realpathSync(options.src)
    if (options.isFile) {
      options.srcFile = src
      options.srcDir = path.dirname(src)
    } else {
      options.srcFile = `${src}/index.js`
      options.srcDir = src
    }

    options.include = []
      .concat(options.include || [])
      .filter(fs.existsSync)
      .map(fs.realpathSync)
  }

  return options
}

export const didOptionsUpdate = (prev, next) =>
  OPTION_KEYS.filter(key => prev[key] !== next[key]).length
