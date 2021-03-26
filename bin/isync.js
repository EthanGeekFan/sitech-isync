#!/usr/bin/env node

const { program } = require('commander')
const packageJson = require('../package.json')
const pull = require('../lib/pull')


program
    .command('pull')
    .description('Pull changes from source data base')
    .action(pull)
    .version(packageJson.version, '-v, --version')

program.parse(process.argv)
