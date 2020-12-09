import { PNG } from 'pngjs';
import { Archive } from '@client/cache/archive';


function toRgba(num: number): number[] {
    num >>>= 0;
    const b = num & 0xFF,
        g = (num & 0xFF00) >>> 8,
        r = (num & 0xFF0000) >>> 16,
        a = ( (num & 0xFF000000) >>> 24 ) / 255;
    return [r, g, b, a];
}

export class Sprite {

    spriteId: number;
    maxWidth: number;
    maxHeight: number;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
    pixelIdx: number[];
    palette: number[];
    pixels: number[];

    public constructor(spriteId: number, width: number, height: number) {
        this.spriteId = spriteId;
        this.maxWidth = width;
        this.maxHeight = height;
    }

    public toPng(): PNG {
        const png = new PNG({
            width: this.width,
            height: this.height,
            filterType: -1
        });

        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {
                const pixel = this.pixels[this.width * y + x];
                const alpha = pixel >> 24;
                const rgba = toRgba(pixel);
                const pngIndex = (this.width * y + x) << 2;

                png.data[pngIndex] = rgba[0];
                png.data[pngIndex + 1] = rgba[1];
                png.data[pngIndex + 2] = rgba[2];
                png.data[pngIndex + 3] = alpha;
            }
        }

        return png;
    }

}

export class SpritePack {

    public readonly archive: Archive;
    public readonly packId: number;

    public constructor(archive: Archive, packId: number) {
        this.archive = archive;
        this.packId = packId;
    }

    public decode(): void {
        const { content: buffer } = this.archive.getFile(this.packId);

        if(buffer.length === 0) {
            throw new Error(`Empty file content for Sprite Pack ${this.packId}.`);
        } else {
            buffer.readerIndex = (buffer.length - 2);
            const spriteCount = buffer.get('SHORT', 'UNSIGNED');
            const sprites: Sprite[] = new Array(spriteCount);

            buffer.readerIndex = (buffer.length - 7 - spriteCount * 8);
            const width = buffer.get('SHORT', 'UNSIGNED');
            const height = buffer.get('SHORT', 'UNSIGNED');
            const paletteLength = buffer.get('BYTE', 'UNSIGNED') + 1;

            for(let i = 0; i < spriteCount; i++) {
                sprites[i] = new Sprite(i, width, height);
            }

            for(let i = 0; i < spriteCount; i++) {
                sprites[i].offsetX = buffer.get('SHORT', 'UNSIGNED');
            }
            for(let i = 0; i < spriteCount; i++) {
                sprites[i].offsetY = buffer.get('SHORT', 'UNSIGNED');
            }
            for(let i = 0; i < spriteCount; i++) {
                sprites[i].width = buffer.get('SHORT', 'UNSIGNED');
            }
            for(let i = 0; i < spriteCount; i++) {
                sprites[i].height = buffer.get('SHORT', 'UNSIGNED');
            }

            buffer.readerIndex = (buffer.length - 7 - spriteCount * 8 - (paletteLength - 1) * 3);
            const palette: number[] = new Array(paletteLength);

            for(let i = 1; i < paletteLength; i++) {
                palette[i] = buffer.get('INT24');

                if(palette[i] === 0) {
                    palette[i] = 1;
                }
            }

            buffer.readerIndex = 0;

            for(let i = 0; i < spriteCount; i++) {
                const sprite = sprites[i];
                const spriteWidth = sprite.width;
                const spriteHeight = sprite.height;
                const dimension = spriteWidth * spriteHeight;
                const pixelPaletteIndicies: number[] = new Array(dimension);
                const pixelAlphas: number[] = new Array(dimension);
                sprite.palette = palette;

                const flags = buffer.get('BYTE', 'UNSIGNED');

                if((flags & 0b01) === 0) {
                    for(let j = 0; j < dimension; j++) {
                        pixelPaletteIndicies[j] = buffer.get('BYTE');
                    }
                } else {
                    for(let x = 0; x < spriteWidth; x++) {
                        for(let y = 0; y < spriteHeight; y++) {
                            pixelPaletteIndicies[spriteWidth * y + x] = buffer.get('BYTE');
                        }
                    }
                }

                if((flags & 0b10) === 0) {
                    for(let j = 0; j < dimension; j++) {
                        const index = pixelPaletteIndicies[j];
                        if(index !== 0) {
                            pixelAlphas[j] = 0xff;
                        }
                    }
                } else {
                    if((flags & 0b01) === 0) {
                        for(let j = 0; j < dimension; j++) {
                            pixelAlphas[j] = buffer.get('BYTE');
                        }
                    } else {
                        for(let x = 0; x < spriteWidth; x++) {
                            for(let y = 0; y < spriteHeight; y++) {
                                pixelAlphas[spriteWidth * y + x] = buffer.get('BYTE');
                            }
                        }
                    }
                }

                sprite.pixelIdx = pixelPaletteIndicies;
                sprite.pixels = new Array(dimension);

                for(let j = 0; j < dimension; j++) {
                    const index = pixelPaletteIndicies[j] & 0xff;
                    sprite.pixels[j] = palette[index] | (pixelAlphas[j] << 24);
                }
            }
        }
    }

}
