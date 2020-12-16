import { Sprite } from './file-store/stores/sprite-store';
import { BrowserWindow } from 'electron';


let unknownArr100 = new Array(32768).fill(0);
let unknownArr200 = new Array(32768).fill(0);
let unknownArr300 = new Array(32768).fill(0);
let unknownArr400 = new Array(32768).fill(0);
let yIndexes = new Array(256).fill(0);
let unknownArr500 = new Array(256).fill(0);
const seedData1 = new Array(256).fill(0);
const seedData2 = new Array(256).fill(0);
const seedData3 = new Array(256).fill(0);
const titleBackgroundPixels = new Sprite(0, 128, 265).autoSize();
const flameBackground = new Sprite(0, 128, 265).autoSize();

let loopCycle = 0;
let anInt1641 = 0;
let anInt2452 = 0;
let anInt2613 = 0;


function calculateFlamePositions(runeImage: Sprite | null) {
    unknownArr300 = new Array(32768).fill(0);

    let height = 256;
    for(let x = 0; x < 5000; x++) {
        const pixelIdx = Math.round(height * (128.0 * Math.random()));
        unknownArr300[pixelIdx] = 256.0 * Math.random();
    }

    for(let i = 0; i < 20; i++) {
        for(let y = 1; height - 1 > y; y++) {
            for(let x = 1; x < 127; x++) {
                const pixel = (y << 7) + x;
                unknownArr400[pixel] = (unknownArr300[pixel - 128] +
                    unknownArr300[pixel - 1] +
                    unknownArr300[pixel + 1] +
                    unknownArr300[128 + pixel]) / 4;
            }
        }

        const is: number[] = unknownArr300;
        unknownArr300 = unknownArr400;
        unknownArr400 = is;
    }

    if(runeImage) {
        let pixelIdx = 0;
        for(let y = 0; runeImage.height > y; y++) {
            for(let x = 0; x < runeImage.width; x++) {
                if(runeImage.pixels[pixelIdx++] !== 0) {
                    const yOffset = runeImage.offsetY + y + 16;
                    const xOffset = runeImage.offsetX + x + 16;
                    const pixel = xOffset + (yOffset << 7);
                    unknownArr300[pixel] = 0;
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
            unknownArr100[(height - 2 << 7) + i] = 255;
        }
    }

    for(let i = 0; i < 100; i++) {
        const randX = Math.round((Math.random() * 124.0) + 2);
        const randY = Math.round(128 + Math.random() * 128.0);
        const pixelIdx = randX + (randY << 7);
        unknownArr100[pixelIdx] = 192;
    }

    for(let y = 1; y < height - 1; y++) {
        for(let x = 1; x < 127; x++) {
            const pixelIdx = x + (y << 7);
            unknownArr200[pixelIdx] = Math.round((unknownArr100[pixelIdx + 1] + unknownArr100[pixelIdx - 1] -
                (-unknownArr100[pixelIdx - 128] - unknownArr100[128 + pixelIdx])) / 4);
        }
    }

    anInt1641 += 128;
    if(anInt1641 > unknownArr300.length) {
        anInt1641 -= unknownArr300.length;
        const runeIdx = Math.round(12.0 * Math.random());
        calculateFlamePositions(runes[runeIdx]);
    }

    for(let y = 1; y < -1 + height; y++) {
        for(let x = 1; x < 127; x++) {
            const pixelIdx = x + (y << 7);
            let value = Math.round(-(unknownArr300[pixelIdx + anInt1641 & -1 + unknownArr300.length] / 5)) + unknownArr200[pixelIdx + 128];
            if(value < 0) {
                value = 0;
            }
            unknownArr100[pixelIdx] = value;
        }
    }

    for(let i = 0; i < height + -1; i++) {
        yIndexes[i] = yIndexes[i + 1];
    }

    yIndexes[height - 1] = (16.0 * Math.sin(loopCycle / 14.0) + 14.0 * Math.sin(loopCycle / 15.0) + 12.0 * Math.sin(loopCycle / 16.0));

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
    return (arg3 * (0xff00 & arg2) + i * (0xff00 & arg1) & 0xff0000) + (~0xff00ff & (0xff00ff & arg1) * i + arg3 * (0xff00ff & arg2)) >> 8;
}

function mixColors(color1: number, color2: number): number {
    return color1 & color2;
}

export function renderFlames() {
    if(anInt2452 <= 0) {
        if(anInt2613 > 0) {
            for(let i = 0; i < 256; i++) {
                if(anInt2613 > 768) {
                    unknownArr500[i] = Math.round(calc(seedData1[i], seedData3[i], -anInt2613 + 1024));
                } else if(anInt2613 > 256) {
                    unknownArr500[i] = Math.round(seedData3[i]);
                } else {
                    unknownArr500[i] = Math.round(calc(seedData3[i], seedData1[i], -anInt2613 + 256));
                }
            }
        } else {
            arrayCopy(seedData1, 0, unknownArr500, 0, 256);
        }
    } else {
        for(let i = 0; i < 256; i++) {
            if(anInt2452 <= 768) {
                if(anInt2452 > 256) {
                    unknownArr500[i] = Math.round(seedData2[i]);
                } else {
                    unknownArr500[i] = Math.round(calc(seedData2[i], seedData1[i], -anInt2452 + 256));
                }
            } else {
                unknownArr500[i] = Math.round(calc(seedData1[i], seedData2[i], -anInt2452 + 1024));
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
            let random1 = unknownArr100[indexX++];

            if(random1 !== 0) {
                const random2 = -random1 + 256;
                const random3 = random1;
                random1 = unknownArr500[random1];
                const originalPixel = flameBackground.pixels[pixelIdx];

                flameBackground.pixels[pixelIdx++] = mixColors(-16711936, mixColors(random1, 16711935) *
                    random3 + random2 * mixColors(originalPixel, 16711935)) + mixColors(mixColors(65280,
                    originalPixel) * random2 + random3 * mixColors(65280, random1), 16711680) >> 8;
            } else {
                pixelIdx++;
            }
        }

        pixelIdx += offsetX;
    }
}

async function resetFlames(titlePixels: number[]): Promise<void> {
    if(!flameBackground.pixels || flameBackground.pixels.length === 0) {
        flameBackground.pixels = new Array(33920).fill(0);
    }

    flameBackground.pixels = titlePixels;

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

    unknownArr500 = new Array(256).fill(0);
    unknownArr400 = new Array(32768).fill(0);
    unknownArr300 = new Array(32768).fill(0);
    calculateFlamePositions(null);
    unknownArr200 = new Array(32768).fill(0);
    unknownArr100 = new Array(32768).fill(0);
}

export function sendRunes(mainWindow: BrowserWindow, titlePixels, runes: Sprite[]): void {
    mainWindow.webContents.send('synchronous-message', {
        type: 'runes',
        runes,
        titlePixels
    });
}

export async function drawFlames(runes: Sprite[], titlePixels, mainWindow: Document): Promise<void> {
    await resetFlames(titlePixels);

    setInterval(async () => {
        try {
            buildFlames(runes);
            renderFlames();

            const flameBase64 = await flameBackground.toBase64();
            const flameBackgroundUrl = `transparent url(data:image/png;base64,${flameBase64})`;

            mainWindow.getElementById('runes-left').style.background = flameBackgroundUrl;
            mainWindow.getElementById('runes-right').style.background = flameBackgroundUrl;
        } catch(error) {
            console.warn(error);
        }

        loopCycle++;
    }, 20);
}
