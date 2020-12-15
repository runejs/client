import { Sprite } from './file-store/stores/sprite-store';
import { BrowserWindow } from 'electron';


let anIntArray178 = new Array(32768).fill(0);
let anIntArray3255 = new Array(32768).fill(0);
let anIntArray1168 = new Array(32768).fill(0);
let anIntArray1445 = new Array(32768).fill(0);
let yIndexes = new Array(256).fill(0);
let anIntArray1013 = new Array(256).fill(0);
const seedData1 = new Array(256).fill(0);
const seedData2 = new Array(256).fill(0);
const seedData3 = new Array(256).fill(0);
const titleBackgroundPixels = new Sprite(0, 128, 265).autoSize();
const flameBackground = new Sprite(0, 128, 265).autoSize();

let loopCycle = 0;
let anInt1641 = 0;
let anInt2452 = 0;
let anInt2613 = 0;


function calculateFlamePositions(runeImage: Sprite) {
    anIntArray1168 = new Array(32768).fill(0);

    let c = 256;
    for(let x = 0; x < 5000; x++) {
        let rand = Math.round(c * (128.0 * Math.random()));
        anIntArray1168[rand] = 256.0 * Math.random();
    }

    for(let i = 0; i < 20; i++) {
        for(let j = 1; -1 + c > j; j++) {
            for(let k = 1; k < 127; k++) {
                let pixel = (j << 7) + k;
                anIntArray1445[pixel] = (anIntArray1168[pixel - 128] +
                    anIntArray1168[pixel + -1] +
                    anIntArray1168[pixel + 1] +
                    anIntArray1168[128 + pixel]) / 4;
            }
        }

        const is: number[] = anIntArray1168;
        anIntArray1168 = anIntArray1445;
        anIntArray1445 = is;
    }

    if(runeImage != null) {
        let pixelIdx = 0;
        for(let y = 0; runeImage.height > y; y++) {
            for(let x = 0; x < runeImage.width; x++) {
                if(runeImage.pixels[pixelIdx++] != 0) {
                    let yOffset = runeImage.offsetY + y + 16;
                    let xOffset = runeImage.offsetX + x + 16;
                    let pixel = xOffset + (yOffset << 7);
                    anIntArray1168[pixel] = 0;
                }
            }
        }
    }
}

export function buildFlames(runes: Sprite[]): void {
    let height = 256;

    for(let i = 10; i < 117; i++) {
        const rand = Math.round(Math.random() * 100.0);
        if(rand < 50) {
            anIntArray178[(height - 2 << 7) + i] = 255;
        }
    }

    for(let i = 0; i < 100; i++) {
        const randX = Math.round((Math.random() * 124.0) + 2);
        const randY = Math.round(128 + Math.random() * 128.0);
        const pixelIdx = Math.round(randX + (randY << 7));
        anIntArray178[pixelIdx] = 192;
    }

    for(let y = 1; y < height - 1; y++) {
        for(let x = 1; x < 127; x++) {
            const rand = Math.round(x + (y << 7));
            anIntArray3255[rand] = (anIntArray178[rand + 1] + anIntArray178[rand - 1] - (-anIntArray178[rand - 128] - anIntArray178[128 + rand])) / 4;
        }
    }

    anInt1641 += 128;
    if(anInt1641 > anIntArray1168.length) {
        anInt1641 -= anIntArray1168.length;
        const runeIdx = Math.round(12.0 * Math.random());
        calculateFlamePositions(runes[runeIdx]);
    }

    for(let y = 1; y < -1 + height; y++) {
        for(let x = 1; x < 127; x++) {
            const pixelIdx = Math.round(x + (y << 7));
            let value = -(anIntArray1168[pixelIdx + anInt1641 & -1 + anIntArray1168.length] / 5) + anIntArray3255[pixelIdx + 128];
            if(value < 0) {
                value = 0;
            }
            anIntArray178[pixelIdx] = Math.round(value);
        }
    }

    for(let i = 0; i < height + -1; i++) {
        yIndexes[i] = yIndexes[i + 1];
    }

    yIndexes[height - 1] = Math.round((16.0 * Math.sin(loopCycle / 14.0) + 14.0 * Math.sin(loopCycle / 15.0) + 12.0 * Math.sin(loopCycle / 16.0)));

    if(anInt2452 > 0) {
        anInt2452 -= 4;
    }

    if(anInt2613 > 0) {
        anInt2613 -= 4;
    }

    if(anInt2452 === 0 && anInt2613 === 0) {
        const rand = Math.round(2000.0 * Math.random());
        if(rand === 0) {
            anInt2452 = 1024;
        }
        if(rand === 1) {
            anInt2613 = 1024;
        }
    }
}

function arrayCopy(src: number[], srcPos: number, dest: number[], destPos: number, end: number): void {
    let loopIdx = 0;
    for(let srcIdx = srcPos; srcIdx < end; srcIdx++) {
        dest[loopIdx++ + destPos] = src[srcIdx];
    }
}

function calc(arg1: number, arg2: number, arg3: number): number {
    const i = 256 - arg3;
    return Math.round((arg3 * (0xff00 & arg2) + i * (0xff00 & arg1) & 0xff0000) + (~0xff00ff & (0xff00ff & arg1) * i + arg3 * (0xff00ff & arg2)) >> 8);
}

function mixColors(color1: number, color2: number): number {
    return color1 & color2;
}

export function renderFlames() {
    if(anInt2452 <= 0) {
        if(anInt2613 > 0) {
            for(let i = 0; i < 256; i++) {
                if(anInt2613 > 768) {
                    anIntArray1013[i] = calc(seedData1[i], seedData3[i], -anInt2613 + 1024);
                } else if(anInt2613 > 256) {
                    anIntArray1013[i] = seedData3[i];
                } else {
                    anIntArray1013[i] = calc(seedData3[i], seedData1[i], -anInt2613 + 256);
                }
            }
        } else {
            arrayCopy(seedData1, 0, anIntArray1013, 0, 256);
        }
    } else {
        for(let i = 0; i < 256; i++) {
            if(anInt2452 <= 768) {
                if(anInt2452 > 256) {
                    anIntArray1013[i] = seedData2[i];
                } else {
                    anIntArray1013[i] = calc(seedData2[i], seedData1[i], -anInt2452 + 256);
                }
            } else {
                anIntArray1013[i] = calc(seedData1[i], seedData2[i], -anInt2452 + 1024);
            }
        }
    }

    for(let i = 0; i < 33920; i++) {
        flameBackground.pixels[i] = titleBackgroundPixels.pixels[i];
    }

    let height = 256;
    let indexX = 0;
    let pixelIdx = 1152;
    for(let y = 1; height - 1 > y; y++) {
        const startX = Math.round((height - y) * yIndexes[y] / height);
        let offsetX = startX + 22;
        if(offsetX < 0) {
            offsetX = 0;
        }
        indexX += offsetX;
        for(let x = offsetX; x < 128; x++) {
            let random1 = anIntArray178[indexX++];
            if(random1 != 0) {
                let random2 = -random1 + 256;
                let random3 = random1;
                random1 = anIntArray1013[random1];
                let originalPixel = flameBackground.pixels[pixelIdx];
                flameBackground.pixels[pixelIdx++] = mixColors(-16711936, mixColors(random1, 16711935) * random3 + random2 *
                    mixColors(originalPixel, 16711935)) + mixColors(mixColors(65280, originalPixel) * random2 + random3 * mixColors(65280, random1), 16711680) >> 8;
            } else {
                pixelIdx++;
            }
        }
        pixelIdx += offsetX;
    }
}

function getPixels(startX: number, startY: number, width: number, height: number, pixelBuffer: number[]): number[] {
    const newPixels = new Array(width * height).fill(0);
    for(let x = startX; x < width; x++) {
        for(let y = startY; y < height; y++) {
            const pixelIdx = x + (y << 7);
            newPixels[pixelIdx] = pixelBuffer[pixelIdx];
        }
    }
    return newPixels;
}

async function resetFlames(titlePixels: number[]): Promise<void> {
    if(!flameBackground.pixels || flameBackground.pixels.length === 0) {
        flameBackground.pixels = new Array(33920).fill(0);
    }

    flameBackground.pixels = getPixels(0, 0, 128, 265, titlePixels);

    titleBackgroundPixels.pixels = new Array(33920).fill(0);
    arrayCopy(flameBackground.pixels, 0, titleBackgroundPixels.pixels, 0, 33920);

    for(let i = 0; i < 64; i++) {
        seedData1[i] = i * 262144;
    }
    for(let i = 0; i < 64; i++) {
        seedData1[64 + i] = 1024 * i + 16711680;
    }
    for(let i = 0; i < 64; i++) {
        seedData1[128 + i] = 16776960 + i * 4;
    }
    for(let i = 0; i < 64; i++) {
        seedData1[i + 192] = 16777215;
    }

    for(let i = 0; i < 64; i++) {
        seedData2[i] = i * 1024;
    }
    for(let i = 0; i < 64; i++) {
        seedData2[i + 64] = 4 * i + 65280;
    }
    for(let i = 0; i < 64; i++) {
        seedData2[128 + i] = i * 262144 + 65535;
    }
    for(let i = 0; i < 64; i++) {
        seedData2[i + 192] = 16777215;
    }

    for(let i = 0; i < 64; i++) {
        seedData3[i] = i * 4;
    }
    for(let i = 0; i < 64; i++) {
        seedData3[64 + i] = 255 + i * 262144;
    }
    for(let i = 0; i < 64; i++) {
        seedData3[128 + i] = i * 1024 + 16711935;
    }
    for(let i = 0; i < 64; i++) {
        seedData3[192 + i] = 16777215;
    }

    anIntArray1013 = new Array(256).fill(0);
    anIntArray1445 = new Array(32768).fill(0);
    anIntArray1168 = new Array(32768).fill(0);
    calculateFlamePositions(null);
    anIntArray3255 = new Array(32768).fill(0);
    anIntArray178 = new Array(32768).fill(0);
}

export function sendRunes(mainWindow: BrowserWindow, runes: Sprite[]): void {
    mainWindow.webContents.send('asynchronous-message', {
        type: 'runes',
        runes
    });
}

export async function drawFlames(runes: Sprite[], titlePixels, mainWindow: BrowserWindow): Promise<void> {
    await resetFlames(titlePixels);

    setInterval(async () => {
        try {
            buildFlames(runes);
            renderFlames();

            const flameBase64 = await flameBackground.toBase64();
            const flameBackgroundUrl = `url(data:image/png;base64,${flameBase64})`;

            mainWindow.webContents.executeJavaScript(`
            document.getElementById('runes-left').style.background = '${flameBackgroundUrl}';
            document.getElementById('runes-right').style.background = '${flameBackgroundUrl}';
            `);
        } catch(error) {
            console.warn(error);
        }

        loopCycle++;
    }, 20);
}
