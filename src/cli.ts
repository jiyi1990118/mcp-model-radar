#!/usr/bin/env node
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const command = process.argv[2];
const cwd = process.cwd();

function run(cmd: string, args: string[] = []): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: true, cwd });
    child.on('close', resolve);
  });
}

async function main() {
  console.log('🚀 AI Model Intelligence MCP\n');

  if (!command || command === 'start') {
    // Start MCP server
    if (!existsSync(join(cwd, 'dist/server.js'))) {
      console.log('📦 Building project...');
      await run('npm', ['run', 'build']);
    }

    if (!existsSync(join(cwd, 'modelradar.db'))) {
      console.log('💾 Initializing database with test data...');
      await run('npm', ['run', 'insert-test']);
    }

    console.log('✨ Starting MCP server...\n');
    await run('npm', ['start']);
  } else if (command === 'init') {
    // Initialize project
    console.log('📦 Installing dependencies...');
    await run('npm', ['install']);

    console.log('🔨 Building project...');
    await run('npm', ['run', 'build']);

    console.log('💾 Inserting test data...');
    await run('npm', ['run', 'insert-test']);

    console.log('\n✅ Initialization complete!');
    console.log('\n🎯 Next steps:');
    console.log('   npm start              - Start MCP server');
    console.log('   npm run test           - Test all tools');
    console.log('   npx modelradar start   - Start via npx');
  } else if (command === 'test') {
    // Run tests
    await run('npm', ['run', 'test']);
  } else {
    console.log('Usage:');
    console.log('  npx modelradar          - Start MCP server (auto-build if needed)');
    console.log('  npx modelradar init     - Initialize project');
    console.log('  npx modelradar start    - Start MCP server');
    console.log('  npx modelradar test     - Run tool tests');
  }
}

main().catch(console.error);
