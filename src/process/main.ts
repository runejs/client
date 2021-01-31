import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import Jimp from 'jimp';
import { Filestore, Sprite } from '@runejs/filestore';

require('source-map-support').install();


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

function sendRunes(titlePixels, runes: Sprite[]): void {
    mainWindow.webContents.send('synchronous-message', {
        type: 'runes',
        runes,
        titlePixels
    });
}

function sendSprite(name: string, base64: string): void {
    mainWindow.webContents.send('synchronous-message', {
        type: name,
        base64
    });
}

async function startUp(): Promise<void> {
    const fileStore = new Filestore('filestore');

    const titleImageBinary = fileStore.getBinaryIndex().getArchive(0, false);
    const titleImage = await Jimp.read(Buffer.from(titleImageBinary.content));
    titleImage.rgba(false);
    const titleImagePixels = await pixelGetter(titleImage);
    const titleImageBase64 = await titleImage.getBase64Async('image/jpeg');

    const runeSpritePack = fileStore.spriteStore.getSpritePack('runes');
    runeSpritePack.decode();

    sendRunes(titleImagePixels, runeSpritePack.sprites.filter(sprite => sprite !== undefined && sprite !== null));

    const logoSpritePack = fileStore.spriteStore.getSpritePack('logo');
    logoSpritePack.decode();

    const titleBoxSpritePack = fileStore.spriteStore.getSpritePack('titlebox');
    titleBoxSpritePack.decode();

    const titleButtonSpritePack = fileStore.spriteStore.getSpritePack('titlebutton');
    titleButtonSpritePack.decode();

    const logoSprite = logoSpritePack.sprites[0];
    const titleBoxSprite = titleBoxSpritePack.sprites[0];
    const titleButtonSprite = titleButtonSpritePack.sprites[0];

    sendSprite('logo', await logoSprite.toBase64());
    sendSprite('titleBox', await titleBoxSprite.toBase64());
    sendSprite('titleButton', await titleButtonSprite.toBase64());

    const bgUrl = `url(${titleImageBase64})`;

    await mainWindow.webContents.executeJavaScript(`
    document.getElementById('title-background-left').style.background = '${bgUrl}';
    document.getElementById('title-background-right').style.background = '${bgUrl}';
    `);

    const scapeMainMidi = fileStore.midiStore.decodeMidiStore()[0];
    const midi = Buffer.from(scapeMainMidi.content);
    if(scapeMainMidi) {
        mainWindow.webContents.send('synchronous-message', {
            type: 'song', midi
        });
    }
}

async function createWindow(): Promise<void> {
    mainWindow = new BrowserWindow({
        //height: 503,
        //width: 765,
        height: 560,
        width: 1300,
        resizable: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            nodeIntegrationInWorker: true
        }
    });

    await mainWindow.loadFile(path.join(__dirname, '../../index.html'));

    mainWindow.webContents.openDevTools();

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

