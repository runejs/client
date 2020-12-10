import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { FileStore } from './file-store/file-store';


function createWindow() {
    const mainWindow = new BrowserWindow({
        height: 503,
        width: 765,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    mainWindow.loadFile(path.join(__dirname, '../index.html'));

    const fileStore = new FileStore('cache');
    fileStore.spriteStore.decodeSpritePacks();

    console.log(fileStore.spriteStore.getImage('logo'));

    const titleImg = fileStore.getBinaryIndex().getArchive(0, false);
    console.log(titleImg.content);

    // mainWindow.webContents.openDevTools();
}

app.on('ready', () => {
    createWindow();

    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    app.quit();
});
