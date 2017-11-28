'use strict'

const config = require('./config.json')
const fs = require('fs-extra')
const packager = require('..')
const path = require('path')
const util = require('./util')

function createPruneOptionTest (baseOpts, prune, testMessage) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    let opts = Object.assign({}, baseOpts)
    opts.name = 'basicTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')
    opts.prune = prune

    let finalPath
    let resourcesPath

    packager(opts)
      .then(paths => {
        finalPath = paths[0]
        return fs.stat(finalPath)
      }).then(stats => {
        t.true(stats.isDirectory(), 'The expected output directory should exist')
        resourcesPath = path.join(finalPath, util.generateResourcesPath(opts))
        return fs.stat(resourcesPath)
      }).then(stats => {
        t.true(stats.isDirectory(), 'The output directory should contain the expected resources subdirectory')
        return fs.stat(path.join(resourcesPath, 'app', 'node_modules', 'run-series'))
      }).then(stats => {
        t.true(stats.isDirectory(), 'npm dependency should exist under app/node_modules')
        return fs.pathExists(path.join(resourcesPath, 'app', 'node_modules', 'run-waterfall'))
      }).then(exists => {
        t.equal(!prune, exists, testMessage)
        return t.end()
      }).catch(t.end)
  }
}

// Not in the loop because it doesn't depend on an executable
util.testSinglePlatform('prune test', baseOpts => {
  return createPruneOptionTest(baseOpts, true, 'package.json devDependency should NOT exist under app/node_modules')
})

util.testSinglePlatform('prune: false test', baseOpts => {
  return createPruneOptionTest(baseOpts, false, 'npm devDependency should exist under app/node_modules')
})
