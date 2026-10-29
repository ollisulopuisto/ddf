#!/usr/bin/env ts-node

import fs from 'node:fs'
import { dirname } from 'node:path'
import { exit } from 'node:process'
import { fileURLToPath } from 'node:url'

// Varmistaa, ettei pnpm-lock.yaml:ssä ole enää haavoittuvia minimatch-versioita.
// minimatchin ReDoS-aukkojen korjaus on versiossa 9.0.7:
// https://github.com/ossf/package-vulnerability-database/blob/main/advisories/minimatch/9.0.6.md
const LOCKFILE = `${dirname(fileURLToPath(import.meta.url))}/../pnpm-lock.yaml`

const VULNERABLE_PACKAGES = ['minimatch@3.1.4:', 'minimatch@9.0.3:']
const VULNERABLE_EDGES = ['minimatch: 3.1.4', 'minimatch: 9.0.3']

let failed = false
const content = fs.readFileSync(LOCKFILE, 'utf8')

for (const [index, line] of content.split('\n').entries()) {
  for (const token of VULNERABLE_PACKAGES) {
    if (line.trimStart().startsWith(token)) {
      failed = true
      console.error(`${LOCKFILE}:${index + 1}: haavoittuva minimatch-pakettilinja: ${line.trim()}`)
    }
  }
  for (const token of VULNERABLE_EDGES) {
    if (line.includes(token)) {
      failed = true
      console.error(`${LOCKFILE}:${index + 1}: haavoittuva minimatch-riippuvuus: ${line.trim()}`)
    }
  }
}

if (failed) {
  console.error('\nminimatch on päivitettävä versioon 9.0.7 tai uudempaan (pnpm update minimatch tai riippuvuuksien päivitys).')
  exit(1)
}

console.log('OK: lukitustiedostossa ei ole haavoittuvia minimatch-versioita.')
