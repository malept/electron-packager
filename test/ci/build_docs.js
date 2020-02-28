#!/usr/bin/env node
'use strict'

const { Application } = require('typedoc')

const config = {
  excludeExternals: true,
  excludePrivate: true,
  excludeProtected: true,
  includeDeclarations: true,
  mode: 'file'
}

const gitRevision = process.argv[2]
if (gitRevision) {
  config.gitRevision = gitRevision
  if (gitRevision.startsWith('v')) {
    config.includeVersion = true
  }
}

const app = new Application()
app.bootstrap(config)

const project = app.convert(['src/index.d.ts'])
if (project) {
  app.generateDocs(project, 'typedoc')
} else {
  console.error('Could not generate API documentation from TypeScript definition!')
  process.exit(1)
}
