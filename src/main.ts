import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { AssetCache } from './cache/asset-cache';


function createWindow() {
    const mainWindow = new BrowserWindow({
        height: 503,
        width: 765,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    mainWindow.loadFile(path.join(__dirname, '../index.html'));

    const assetCache = new AssetCache('cache');
    const spritePacks = assetCache.decodeSpritePacks();
    console.log('Sprite Packs: ' + spritePacks);

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
