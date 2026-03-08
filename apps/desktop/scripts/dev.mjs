import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, '..');
const npmCommand = 'npm';

const children = [];
let shuttingDown = false;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const killChild = async (child) => {
  if (!child?.pid) {
    return;
  }

  if (process.platform === 'win32') {
    await new Promise((resolve) => {
      const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
        stdio: 'ignore',
        windowsHide: true,
      });
      killer.on('exit', resolve);
      killer.on('error', resolve);
    });
    return;
  }

  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    child.kill('SIGTERM');
  }
};

const cleanup = async (exitCode = 0) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  await Promise.all(children.map((child) => killChild(child)));
  process.exit(exitCode);
};

const run = (label, args, extraEnv = {}) => {
  const child = spawn(npmCommand, args, {
    cwd: appRoot,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
    detached: process.platform !== 'win32',
    shell: process.platform === 'win32',
  });

  children.push(child);

  child.on('exit', (code) => {
    if (shuttingDown) {
      return;
    }

    if (code && code !== 0) {
      console.error(`[${label}] exited with code ${code}`);
      void cleanup(code);
    }
  });

  child.on('error', (error) => {
    if (shuttingDown) {
      return;
    }

    console.error(`[${label}] failed to start`, error);
    void cleanup(1);
  });

  return child;
};

const findFreePort = async (startPort) => {
  let port = startPort;

  while (true) {
    const isAvailable = await new Promise((resolve) => {
      const server = net.createServer();
      server.unref();
      server.on('error', () => resolve(false));
      server.listen(port, '127.0.0.1', () => {
        server.close(() => resolve(true));
      });
    });

    if (isAvailable) {
      return port;
    }

    port += 1;
  }
};

const waitForFile = async (targetPath) => {
  for (let attempt = 0; attempt < 240; attempt += 1) {
    try {
      await fs.access(targetPath);
      return;
    } catch {
      await delay(250);
    }
  }

  throw new Error(`Timed out waiting for ${targetPath}`);
};

const waitForPort = async (port) => {
  for (let attempt = 0; attempt < 240; attempt += 1) {
    const isOpen = await new Promise((resolve) => {
      const socket = net.createConnection({ port, host: '127.0.0.1' });
      socket.setTimeout(1000);
      socket.on('connect', () => {
        socket.end();
        resolve(true);
      });
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      socket.on('error', () => resolve(false));
    });

    if (isOpen) {
      return;
    }

    await delay(250);
  }

  throw new Error(`Timed out waiting for port ${port}`);
};

process.on('SIGINT', () => {
  void cleanup(0);
});

process.on('SIGTERM', () => {
  void cleanup(0);
});

const port = await findFreePort(5173);
const devServerUrl = `http://127.0.0.1:${port}`;

console.log(`[dev] using renderer port ${port}`);

run('renderer', ['run', 'dev:renderer', '--', '--port', String(port)]);
run('electron:build', ['run', 'dev:electron:build']);

await Promise.all([
  waitForFile(path.join(appRoot, 'dist-electron', 'electron', 'main.js')),
  waitForFile(path.join(appRoot, 'dist-electron', 'electron', 'preload.js')),
  waitForPort(port),
]);

const electronChild = run('electron:start', ['run', 'dev:electron:start'], {
  VITE_DEV_SERVER_URL: devServerUrl,
});

electronChild.on('exit', (code) => {
  if (shuttingDown) {
    return;
  }

  void cleanup(code ?? 0);
});
