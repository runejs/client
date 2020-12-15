import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { FileStore } from './file-store/file-store';
import { drawFlames } from './runes';
import Jimp from 'jimp';


const pixelGetter = (img: Jimp) => {
    const width = img.getWidth();
    const height = img.getHeight();
    const pixels: number[] = new Array(width * height);

    for(let x = 0; x < width; x++) {
        for(let y = 0; y < height; y++) {
            const pixelIdx = x + (y << 7);
            pixels[pixelIdx] = img.getPixelColor(x, y);
        }
    }

    return pixels;
}


require('source-map-support').install();


async function startUp(mainWindow: BrowserWindow): Promise<void> {
    const fileStore = new FileStore('cache');
    fileStore.spriteStore.decodeSpritePacks();

    const titleImageBinary = fileStore.getBinaryIndex().getArchive(0, false);
    const titleImage = await Jimp.read(Buffer.from(titleImageBinary.content));
    const titleImagePixels = pixelGetter(titleImage);
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
