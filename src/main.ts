import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { FileStore } from './cache/file-store';


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
    const spritePacks = fileStore.decodeSpritePacks();
    for(const pack of spritePacks) {
        console.log(fileStore.getFileName(pack.nameHash));
    }

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
