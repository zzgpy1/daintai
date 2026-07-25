#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

console.log(`${colors.cyan}🚀 GlobalRadio 发布工具${colors.reset}`)
console.log(`${colors.cyan}==========================${colors.reset}\n`)

// 读取package.json
const packagePath = path.join(process.cwd(), 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
const currentVersion = packageJson.version

console.log(`${colors.blue}当前版本: ${colors.green}v${currentVersion}${colors.reset}\n`)

// 询问新版本号
rl.question(`${colors.yellow}请输入新版本号 (直接回车跳过): ${colors.reset}`, (newVersion) => {
  if (newVersion) {
    packageJson.version = newVersion
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
    console.log(`${colors.green}✅ 版本号已更新为 v${newVersion}${colors.reset}\n`)
    
    try {
      execSync(`git add package.json`, { stdio: 'inherit' })
      execSync(`git commit -m "chore: bump version to v${newVersion}"`, { stdio: 'inherit' })
      execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`, { stdio: 'inherit' })
      console.log(`${colors.green}✅ Git tag 已创建${colors.reset}\n`)
    } catch (error) {
      console.log(`${colors.red}❌ Git操作失败: ${error.message}${colors.reset}`)
    }
  }

  // 构建选项
  console.log(`${colors.blue}请选择构建目标:${colors.reset}`)
  console.log(`  ${colors.cyan}1.${colors.reset} 全平台构建 (Web + Electron + Android + Docker)`)
  console.log(`  ${colors.cyan}2.${colors.reset} 仅 Web`)
  console.log(`  ${colors.cyan}3.${colors.reset} 仅 Windows`)
  console.log(`  ${colors.cyan}4.${colors.reset} 仅 macOS`)
  console.log(`  ${colors.cyan}5.${colors.reset} 仅 Linux`)
  console.log(`  ${colors.cyan}6.${colors.reset} 仅 Android`)
  console.log(`  ${colors.cyan}7.${colors.reset} Docker 镜像`)

  rl.question(`\n${colors.yellow}请选择 [1-7]: ${colors.reset}`, (choice) => {
    console.log('')

    const commands: Record<string, string[]> = {
      '1': ['npm run build', 'npm run electron:build:win', 'npm run electron:build:mac', 'npm run electron:build:linux', 'npm run build:android', 'npm run docker:build'],
      '2': ['npm run build'],
      '3': ['npm run electron:build:win'],
      '4': ['npm run electron:build:mac'],
      '5': ['npm run electron:build:linux'],
      '6': ['npm run build:android'],
      '7': ['npm run docker:build', 'npm run docker:push']
    }

    const selected = commands[choice]
    if (!selected) {
      console.log(`${colors.red}❌ 无效选择${colors.reset}`)
      rl.close()
      return
    }

    console.log(`${colors.blue}开始构建...${colors.reset}\n`)

    for (const cmd of selected) {
      console.log(`${colors.cyan}▶ ${cmd}${colors.reset}`)
      try {
        execSync(cmd, { stdio: 'inherit', shell: true })
        console.log(`${colors.green}✅ ${cmd} 完成${colors.reset}\n`)
      } catch (error) {
        console.log(`${colors.red}❌ ${cmd} 失败: ${error.message}${colors.reset}`)
        rl.close()
        process.exit(1)
      }
    }

    console.log(`${colors.green}🎉 发布完成!${colors.reset}`)
    rl.close()
  })
})
