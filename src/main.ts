import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { FileStore } from './file-store/file-store';
import { drawFlames } from './runes';
import Jimp from 'jimp';


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


async function startUp(mainWindow: BrowserWindow): Promise<void> {
    const fileStore = new FileStore('cache');
    fileStore.spriteStore.decodeSpritePacks();

    const titleImageBinary = fileStore.getBinaryIndex().getArchive(0, false);
    const titleImage = await Jimp.read(Buffer.from(titleImageBinary.content));
    titleImage.rgba(false);
    const titleImagePixels = await pixelGetter(titleImage);
    const titleImageBase64 = await titleImage.getBase64Async('image/jpeg');

    // sendRunes(mainWindow, titleImagePixels, fileStore.spriteStore.getPack('runes').sprites);
    drawFlames(fileStore.spriteStore.getPack('runes').sprites, titleImagePixels, mainWindow);

    const bgUrl = `url(${titleImageBase64})`;

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
