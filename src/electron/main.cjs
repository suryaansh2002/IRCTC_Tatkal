const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let pythonProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadURL('http://localhost:3000');
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  console.log("App Ready")
  // Spawn the Python process
  pythonProcess = spawn('python', ['src/python/backend.py']);
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