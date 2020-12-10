import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { FileStore } from './file-store/file-store';
import { lastValueFrom, timer } from 'rxjs';
import { take } from 'rxjs/operators';


async function loadRunes(fileStore: FileStore): Promise<string[]> {
    return new Promise(async resolve => {
        const runeSpriteStore = fileStore.spriteStore.getPack('runes');
        const runePngs = [];

        for(const sprite of runeSpriteStore.sprites) {
            runePngs.push(await sprite.toBase64());
        }

        resolve(runePngs);
    });
}

let runeIdx: number = 0;
async function handleRunes(mainWindow: BrowserWindow, runes: string[]): Promise<void> {
    const rune = runes[runeIdx++];
    if(runeIdx >= runes.length) {
        runeIdx = 0;
    }
    const runeUrl = `url(data:image/png;base64,${rune}) no-repeat center center`;
    mainWindow.webContents.executeJavaScript(`
    document.getElementById('runes-left').style.background = '${runeUrl}';
    document.getElementById('runes-right').style.background = '${runeUrl}';
    `);

    await lastValueFrom(timer(1000).pipe(take(1)));
    await handleRunes(mainWindow, runes);
}

async function startUp(mainWindow: BrowserWindow): Promise<void> {
    const fileStore = new FileStore('cache');
    fileStore.spriteStore.decodeSpritePacks();

    const runes = await loadRunes(fileStore);
    handleRunes(mainWindow, runes);

    const titleImg = fileStore.getBinaryIndex().getArchive(0, false);
    const bgUrl = `url(data:image/jpeg;base64,${Buffer.from(titleImg.content).toString('base64')})`;

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
