const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let pythonProcess;

function createWindow() {
  console.log(path.join(__dirname, 'assets/logo.png'))
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/logo.png') // Set the path to your icon
  });

  const startURL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../react/index.html')}`;

  mainWindow.loadURL(startURL).catch(err => console.error(`Failed to load UI: ${err}`));

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  console.log("App Ready")
  // Spawn the Python process
  if (process.env.NODE_ENV === 'development') {
    console.log('Starting Python backend in development mode');
    pythonProcess = spawn('python', ['src/python/backend.py']);
  } else {
    console.log('Starting Python backend in production mode');
    const pythonExecutable = path.join(process.resourcesPath, 'backend', 'irctc_backend');
    pythonProcess = spawn(pythonExecutable);
  }

  // Handle data from Python
  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python stdout: ${data}`);
    mainWindow.webContents.send('python-message', data.toString());
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
  });
});

ipcMain.on('schedule-booking', (event, data) => {
  console.log('Received booking data:', data);
  if (pythonProcess) {
    pythonProcess.stdin.write(JSON.stringify(data) + '\n');
  }
});