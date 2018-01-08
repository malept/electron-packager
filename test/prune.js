'use strict'

const fs = require('fs-extra')
const path = require('path')
const util = require('./_util')

function createPruneOptionTest (t, baseOpts, prune, testMessage) {
  const opts = Object.assign({}, baseOpts, {
    name: 'pruneTest',
    dir: util.fixtureSubdir('basic'),
    prune: prune
  })

  let modulePath
  let resourcesPath

  return util.packageAndEnsureResourcesPath(t, opts)
    .then(generatedResourcesPath => {
      resourcesPath = generatedResourcesPath
      modulePath = path.join(resourcesPath, 'app', 'node_modules', 'run-series')
      return fs.pathExists(modulePath)
    }).then(exists => {
      t.true(exists, 'module dependency should exist under app/node_modules')
      return fs.stat(modulePath)
    }).then(stats => {
      t.true(stats.isDirectory(), 'module is a directory')
      return fs.pathExists(path.join(resourcesPath, 'app', 'node_modules', 'run-waterfall'))
    }).then(exists => {
      t.is(!prune, exists, testMessage)
      return fs.pathExists(path.join(resourcesPath, 'app', 'node_modules', 'electron-prebuilt'))
    }).then(exists => t.is(!prune, exists, testMessage))
}

util.testSinglePlatform('prune test', (t, baseOpts) => {
  return createPruneOptionTest(t, baseOpts, true, 'package.json devDependency should NOT exist under app/node_modules')
})

util.testSinglePlatform('prune: false test', createPruneOptionTest, false,
                        'package.json devDependency should exist under app/node_modules')
