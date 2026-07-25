#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

console.log(`${colors.cyan}📦 版本号更新工具${colors.reset}\n`)

// 读取package.json
const packagePath = path.join(process.cwd(), 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
const currentVersion = packageJson.version

console.log(`${colors.blue}当前版本: ${colors.green}v${currentVersion}${colors.reset}`)

// 解析版本号
const parts = currentVersion.split('.').map(Number)
const [major, minor, patch] = parts

console.log(`\n${colors.yellow}请选择更新类型:${colors.reset}`)
console.log(`  ${colors.cyan}1.${colors.reset} 补丁版本 (${major}.${minor}.${patch + 1})`)
console.log(`  ${colors.cyan}2.${colors.reset} 次版本 (${major}.${minor + 1}.0)`)
console.log(`  ${colors.cyan}3.${colors.reset} 主版本 (${major + 1}.0.0)`)
console.log(`  ${colors.cyan}4.${colors.reset} 自定义版本`)

rl.question(`\n请选择 [1-4]: `, (choice) => {
  let newVersion = ''

  switch (choice) {
    case '1':
      newVersion = `${major}.${minor}.${patch + 1}`
      break
    case '2':
      newVersion = `${major}.${minor + 1}.0`
      break
    case '3':
      newVersion = `${major + 1}.0.0`
      break
    case '4':
      rl.question(`请输入新版本号: `, (custom) => {
        newVersion = custom
        updateVersion(newVersion)
        rl.close()
      })
      return
    default:
      console.log('❌ 无效选择')
      rl.close()
      process.exit(1)
  }

  updateVersion(newVersion)
  rl.close()
})

function updateVersion(newVersion) {
  // 更新package.json
  packageJson.version = newVersion
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))

  // 更新其他文件
  const filesToUpdate = [
    'src/config/app.config.ts',
    'public/manifest.json',
    'capacitor.config.ts'
  ]

  for (const file of filesToUpdate) {
    const filePath = path.join(process.cwd(), file)
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8')
      content = content.replace(/"version":\s*"[^"]*"/, `"version": "${newVersion}"`)
      content = content.replace(/version:\s*'[^']*'/, `version: '${newVersion}'`)
      fs.writeFileSync(filePath, content)
    }
  }

  console.log(`\n${colors.green}✅ 版本号已更新: v${newVersion}${colors.reset}`)

  // 询问是否提交
  rl.question(`\n是否提交版本更新? (y/N): `, (answer) => {
    if (answer.toLowerCase() === 'y') {
      try {
        execSync(`git add package.json`, { stdio: 'inherit' })
        execSync(`git commit -m "chore: bump version to v${newVersion}"`, { stdio: 'inherit' })
        execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`, { stdio: 'inherit' })
        console.log(`${colors.green}✅ Git提交完成${colors.reset}`)
      } catch (error) {
        console.log(`❌ Git操作失败: ${error.message}`)
      }
    }
    rl.close()
  })
}
