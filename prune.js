'use strict'

const common = require('./common')
const floraColossus = require('flora-colossus')
const fs = require('fs-extra')
const path = require('path')

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

  normalizeModulePath (module) {
    return this.normalizePath(module.path).replace(this.baseDir, '')
  }

  pruneModule (name) {
    if (this.walkedTree) {
      return this.isProductionModule(name)
    } else {
      return this.walker.walkTree()
        .then(allModules => {
          this.moduleMap = new Map(allModules.map(module => [this.normalizeModulePath(module), module]))
          this.walkedTree = true
          return null
        }).then(() => this.isProductionModule(name))
    }
  }

  isProductionModule (name) {
    const module = this.moduleMap.get(name)
    if (!module) {
      common.warning(`Could not find '${name}' in list of known modules, pruning`)
      return false
    }

    const isDevDep = module.depType !== floraColossus.DepType.DEV

    /* istanbul ignore if */
    if (this.isProductionElectronModule(name, isDevDep)) {
      common.warning(`Found '${module.name}' but not as a devDependency, pruning anyway`)
      return false
    }

    return isDevDep
  }

  isProductionElectronModule (name, isDevDep) {
    return ELECTRON_MODULES.some(moduleName => name.endsWith(`/${moduleName}`)) && !isDevDep
  }
}

module.exports = {
  isModule: function isModule (pathToCheck) {
    return fs.stat(pathToCheck)
      .then(stats => {
        if (stats.isDirectory()) {
          const packageJSON = path.join(pathToCheck, 'package.json')
          return fs.pathExists(packageJSON)
        } else {
          return false
        }
      })
  },
  Pruner: Pruner
}
