import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { FileStore } from './file-store/file-store';
import { sendRunes } from './runes';
import Jimp from 'jimp';


let mainWindow: BrowserWindow;

const pixelGetter = async (image: Jimp) => {
    return new Promise(resolve => {
        const width = 128;
        const height = 265;
        const pixels: number[] = new Array(width * height);

        image.scan(0, 0, width, height, (x, y, idx) => {
            const red = image.bitmap.data[idx];
            const green = image.bitmap.data[idx + 1];
            const blue = image.bitmap.data[idx + 2];

            const pixelIdx = x + (y << 7);
            pixels[pixelIdx] = (red << 16) + (green << 8) + (blue);
        }, () => {
            resolve(pixels);
        });
    });
}


require('source-map-support').install();


async function startUp(): Promise<void> {
    const fileStore = new FileStore('cache');
    fileStore.spriteStore.decodeSpritePacks();

    const titleImageBinary = fileStore.getBinaryIndex().getArchive(0, false);
    const titleImage = await Jimp.read(Buffer.from(titleImageBinary.content));
    titleImage.rgba(false);
    const titleImagePixels = await pixelGetter(titleImage);
    const titleImageBase64 = await titleImage.getBase64Async('image/jpeg');

    sendRunes(mainWindow, titleImagePixels, fileStore.spriteStore.getPack('runes').sprites);

    const bgUrl = `url(${titleImageBase64})`;

    mainWindow.webContents.executeJavaScript(`
    document.getElementById('title-background-left').style.background = '${bgUrl}';
    document.getElementById('title-background-right').style.background = '${bgUrl}';
    `);
}

function openDevToolsWindow(): void {
    const devtools = new BrowserWindow();
    mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
    mainWindow.webContents.openDevTools({ mode: 'detach' });

    mainWindow.webContents.once('did-finish-load', () => {
        const windowBounds = mainWindow.getBounds();
        devtools.setPosition(windowBounds.x + windowBounds.width, windowBounds.y);
        devtools.setSize(400, 503);
    });

    mainWindow.on('move',  () => {
        const windowBounds = mainWindow.getBounds();
        devtools.setPosition(windowBounds.x + windowBounds.width, windowBounds.y);
    });
}

async function createWindow(): Promise<void> {
    mainWindow = new BrowserWindow({
        height: 503,
        width: 765,
        // width: 1100,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            nodeIntegrationInWorker: true
        }
    });

    openDevToolsWindow();

    await mainWindow.loadFile(path.join(__dirname, '../index.html'));
    // mainWindow.webContents.openDevTools();

    await startUp();
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

