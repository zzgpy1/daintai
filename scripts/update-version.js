#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const version = process.argv[2]
if (!version) {
  console.error('请提供版本号: npm run update-version 2.0.1')
  process.exit(1)
}

// 更新 package.json
const packagePath = resolve('package.json')
const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'))
packageJson.version = version
writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n')
console.log(`✅ 已更新 package.json 版本为 ${version}`)

// 更新 capacitor.config.ts
const capacitorPath = resolve('capacitor/config.ts')
let capacitorContent = readFileSync(capacitorPath, 'utf-8')
capacitorContent = capacitorContent.replace(
  /appName: '[\s\S]*?'/,
  `appName: '全球电台 ${version}'`
)
writeFileSync(capacitorPath, capacitorContent)
console.log(`✅ 已更新 capacitor/config.ts`)

// 更新 app.config.ts
const configPath = resolve('src/config/app.config.ts')
let configContent = readFileSync(configPath, 'utf-8')
configContent = configContent.replace(
  /version: '[\d.]+'/,
  `version: '${version}'`
)
writeFileSync(configPath, configContent)
console.log(`✅ 已更新 src/config/app.config.ts`)

console.log(`🎉 版本更新完成: ${version}`)
