const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    title: "Leitor de PDF Desktop",
    webPreferences: {
      nodeIntegration: false, // Segurança: isola o contexto do Node do navegador
      contextIsolation: true
    }
  });

  // Oculta o menu padrão do aplicativo (opcional)
  win.setMenu(null);

  // Carrega o arquivo HTML do leitor
  win.loadFile('index.html');
}

// Inicializa o aplicativo quando o Electron estiver pronto
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Encerra o app quando todas as janelas forem fechadas (exceto no macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});