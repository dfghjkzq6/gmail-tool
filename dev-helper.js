#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class DevHelper {
  constructor() {
    this.devProcess = null;
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) {
      console.log('🚀 Development server is already running');
      return;
    }

    console.log('🚀 Starting development server...');
    
    // Check if node_modules exists
    if (!fs.existsSync('node_modules')) {
      console.log('📦 Installing dependencies...');
      await this.runCommand('npm install');
    }

    // Check environment variables
    this.checkEnv();

    // Start the dev server
    this.devProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });

    this.isRunning = true;
    
    this.devProcess.on('close', (code) => {
      console.log(`\n🛑 Development server stopped (code: ${code})`);
      this.isRunning = false;
      this.devProcess = null;
    });

    // Open browser after a short delay
    setTimeout(() => {
      console.log('🌐 Opening debug page...');
      this.openBrowser('http://localhost:3000/debug-test.html');
    }, 3000);

    console.log('✅ Development server started!');
    console.log('🔧 Use "node dev-helper.js stop" to stop');
    console.log('🌐 Debug page: http://localhost:3000/debug-test.html');
  }

  stop() {
    if (!this.isRunning) {
      console.log('🛑 Development server is not running');
      return;
    }

    console.log('🛑 Stopping development server...');
    
    if (this.devProcess) {
      this.devProcess.kill('SIGTERM');
      setTimeout(() => {
        if (this.devProcess && !this.devProcess.killed) {
          this.devProcess.kill('SIGKILL');
        }
      }, 5000);
    }
  }

  status() {
    if (this.isRunning) {
      console.log('✅ Development server is running');
      console.log('🌐 Debug page: http://localhost:3000/debug-test.html');
    } else {
      console.log('🛑 Development server is not running');
    }
  }

  debug() {
    console.log('🔍 Running debug checks...\n');
    
    // Check environment
    this.checkEnv();
    
    // Check modules
    console.log('\n📦 Checking modules...');
    try {
      require('./lib/debug.js');
      console.log('✅ debug.js loaded');
    } catch (e) {
      console.log('❌ debug.js failed:', e.message);
    }

    try {
      require('./lib/gmail.js');
      console.log('✅ gmail.js loaded');
    } catch (e) {
      console.log('❌ gmail.js failed:', e.message);
    }

    // Check API routes
    console.log('\n🛣️  Checking API routes...');
    const routes = [
      '/api/auth/[...nextauth]/route.js',
      '/api/gmail/messages/route.js',
      '/api/gmail/labels/route.js'
    ];

    routes.forEach(route => {
      const fullPath = path.join('app', route);
      if (fs.existsSync(fullPath)) {
        console.log(`✅ ${route}`);
      } else {
        console.log(`❌ ${route} missing`);
      }
    });

    console.log('\n🔧 Quick start: node dev-helper.js start');
  }

  checkEnv() {
    console.log('\n🔧 Checking environment...');
    const envFile = '.env.local';
    
    if (!fs.existsSync(envFile)) {
      console.log('❌ .env.local file missing');
      return;
    }

    const envContent = fs.readFileSync(envFile, 'utf8');
    const requiredVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];

    requiredVars.forEach(varName => {
      if (envContent.includes(`${varName}=`)) {
        console.log(`✅ ${varName} set`);
      } else {
        console.log(`❌ ${varName} missing`);
      }
    });
  }

  openBrowser(url) {
    const start = process.platform === 'darwin' ? 'open' : 
                  process.platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${start} ${url}`);
  }

  runCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      });
    });
  }
}

// CLI interface
const helper = new DevHelper();
const command = process.argv[2];

switch (command) {
  case 'start':
    helper.start();
    break;
  case 'stop':
    helper.stop();
    break;
  case 'status':
    helper.status();
    break;
  case 'debug':
    helper.debug();
    break;
  default:
    console.log(`
🔧 Gmail Tool Development Helper

Usage: node dev-helper.js [command]

Commands:
  start   - Start development server and open debug page
  stop    - Stop development server
  status  - Check if server is running
  debug   - Run environment and module checks

Examples:
  node dev-helper.js start
  node dev-helper.js debug
  node dev-helper.js stop
`);
}
