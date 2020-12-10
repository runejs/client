import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { FileStore } from './file-store/file-store';


function startUp(mainWindow: BrowserWindow): void {
    const fileStore = new FileStore('cache');
    fileStore.spriteStore.decodeSpritePacks();

    // console.log(fileStore.spriteStore.getImage('logo'));

    const titleImg = fileStore.getBinaryIndex().getArchive(0, false);
    const bgUrl = `url(data:image/jpeg;base64,${new Buffer(titleImg.content).toString('base64')})`;

    mainWindow.webContents.executeJavaScript(`
    document.getElementById('title-background-left').style.background = '${bgUrl}';
    document.getElementById('title-background-right').style.background = '${bgUrl}';
    `);
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        height: 503,
        width: 765,
        //width: 1100,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    mainWindow.loadFile(path.join(__dirname, '../index.html'));

    startUp(mainWindow);

    //mainWindow.webContents.openDevTools();
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
