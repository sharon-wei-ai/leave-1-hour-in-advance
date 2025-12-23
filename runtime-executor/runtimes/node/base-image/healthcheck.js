#!/usr/bin/env node
/** Health check script for Node.js runtime container. */

try {
  // 简单检查 Node.js 环境是否正常
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  if (major < 18) {
    console.error(`ERROR: Node.js version ${version} is too old, need >= 18`);
    process.exit(1);
  }
  console.log('OK');
  process.exit(0);
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
}

