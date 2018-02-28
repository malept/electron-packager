'use strict'

const common = require('./common')
const galactus = require('galactus')
const fs = require('fs-extra')
const path = require('path')

const ELECTRON_MODULES = [
  'electron',
  'electron-prebuilt',
  'electron-prebuilt-compile'
]

class Pruner {
  constructor (dir) {
    this.baseDir = common.normalizePath(dir)
    this.galactus = new galactus.DestroyerOfModules({
      rootDirectory: dir,
      shouldKeepModuleTest: (module, isDevDep) => this.shouldKeepModule(module, isDevDep)
    })
    this.walkedTree = false
  }

  normalizeModulePath (modulePath) {
    return common.normalizePath(modulePath).replace(this.baseDir, '')
  }

  setModuleMap (moduleMap) {
    this.moduleMap = new Map()
    for (const [modulePath, module] of moduleMap) {
      this.moduleMap.set(this.normalizeModulePath(modulePath), module)
    }
    this.walkedTree = true
  }

  pruneModule (name) {
    if (this.walkedTree) {
      return this.isProductionModule(name)
    } else {
      return this.galactus.collectKeptModules()
        .then(moduleMap => this.setModuleMap(moduleMap))
        .then(() => this.isProductionModule(name))
    }
  }

  shouldKeepModule (module, isDevDep) {
    if (isDevDep || module.depType === galactus.DepType.ROOT) {
      return false
    }

    if (this.isProductionElectronModule(module.name, isDevDep)) {
      common.warning(`Found '${module.name}' but not as a devDependency, pruning anyway`)
      return false
    }

    return true
  }

  isProductionModule (name) {
    return !!this.moduleMap.get(name)
  }

  isProductionElectronModule (name, isDevDep) {
    return ELECTRON_MODULES.some(moduleName => name.endsWith(`/${moduleName}`)) && !isDevDep
  }
}

module.exports = {
  isModule: function isModule (pathToCheck) {
    return fs.pathExists(path.join(pathToCheck, 'package.json'))
  },
  Pruner: Pruner
}
