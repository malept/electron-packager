'use strict'

const common = require('./common')
const floraColossus = require('flora-colossus')

const ELECTRON_MODULES = [
  'electron',
  'electron-prebuilt',
  'electron-prebuilt-compile'
]

class Pruner {
  constructor (dir) {
    this.baseDir = this.normalizePath(dir)
    this.walker = new floraColossus.Walker(dir)
    this.walkedTree = false
  }

  normalizePath (path) {
    return path.replace(/\\/g, '/')
  }

  pruneModule (name) {
    if (this.walkedTree) {
      return this.isProductionModule(name)
    } else {
      return this.walker.walkTree()
        .then(allModules => {
          this.moduleMap = new Map(allModules.map(module => [this.normalizePath(module.path).replace(this.baseDir, ''), module]))
          this.walkedTree = true
          return null
        }).then(() => this.isProductionModule(name))
    }
  }

  isProductionModule (name) {
    const module = this.moduleMap.get(name)
    if (!module) return false

    if (ELECTRON_MODULES.some(moduleName => name.endsWith(`/${moduleName}`))) {
      /* istanbul ignore if */
      if (module.depType !== floraColossus.DepType.DEV) {
        common.warning(`Found '${module.name}' but not as a devDependency, pruning anyway`)
      }
      return false
    }

    return module.depType !== floraColossus.DepType.DEV
  }
}

module.exports = {
  Pruner: Pruner
}
