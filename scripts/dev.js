#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const os = require('os');
const net = require('net');

// Get the local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip over non-IPv4 and internal (loopback) addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1'; // Fallback to localhost
}

// Kill any process running on the specified port
function killProcessOnPort(port) {
  return new Promise((resolve) => {
    const isWin = process.platform === 'win32';
    
    if (isWin) {
      // Windows command
      exec(`FOR /F "tokens=5" %P IN ('netstat -ano ^| findstr :${port} ^| findstr LISTENING') DO (TaskKill /PID %P /F)`, (error) => {
        resolve();
      });
    } else {
      // Unix/Mac command
      exec(`lsof -i :${port} | grep LISTEN | awk '{print $2}' | xargs -r kill -9`, (error) => {
        resolve();
      });
    }
  });
}

// Check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

async function start() {
  const localIP = getLocalIP();
  const port = 3000; // Always use port 3000
  
  // First kill any existing process on port 3000
  await killProcessOnPort(port);
  
  // Give the OS a moment to release the port
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.clear();
  console.log(`\n🚀 Starting development server...`);
  console.log(`🌐 Local:        http://localhost:${port}`);
  console.log(`🌐 Network:      http://${localIP}:${port}\n`);
  
  // Run Next.js dev command with port 3000 and hide the built-in info
  const nextDev = spawn('next', ['dev', '--hostname', '0.0.0.0', '-p', port.toString()]);
  
  // Process output to suppress Next.js built-in network display
  nextDev.stdout.on('data', (data) => {
    const output = data.toString();
    // Allow more output to help debug network issues
    if (!output.includes('0.0.0.0:')) {
      process.stdout.write(output);
    }
  });
  
  nextDev.stderr.on('data', (data) => {
    process.stderr.write(data);
  });
  
  process.on('SIGINT', () => {
    nextDev.kill('SIGINT');
    process.exit(0);
  });
}

start();