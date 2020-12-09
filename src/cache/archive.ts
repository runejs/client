import { ByteBuffer } from '@runejs/core';
import { FileData } from '@client/cache/file-data';
import { gunzipSync } from 'zlib';
import { ArchiveIndex } from '@client/cache/archive-index';
import { CacheChannel } from '@client/cache/fs/channels';
import { readIndexEntry } from '@client/cache/fs/cache-fs';
const seekBzip = require('seek-bzip');


export class Archive extends FileData {

    public readonly index: ArchiveIndex;
    public crc: number;
    public whirlpool: ByteBuffer = new ByteBuffer(64);
    public version: number;
    public compression: number;
    public files: Map<number, FileData>;
    private readonly cacheChannel: CacheChannel;

    public constructor(id: number, index: ArchiveIndex, cacheChannel: CacheChannel) {
        super(id);
        this.index = index;
        this.cacheChannel = cacheChannel;
        this.files = new Map<number, FileData>();
    }

    public decode(): void {
        const archiveFile = readIndexEntry(this.fileId, this.index.indexId, this.cacheChannel);
        const  { compression, version, buffer } = this.decompress(archiveFile.dataFile);
        const archiveSize = this.index.archives.size;

        this.version = version;
        this.content = buffer;
        this.compression = compression;
        this.files.clear();
        buffer.readerIndex = (buffer.length - 1);
        const chunkCount = buffer.get('BYTE', 'UNSIGNED');

        const chunkSizes: number[][] = new Array(chunkCount).fill(new Array(archiveSize));
        const sizes: number[] = new Array(archiveSize).fill(0);
        buffer.readerIndex = (buffer.length - 1 - chunkCount * archiveSize * 4);
        for(let chunk = 0; chunk < chunkCount; chunk++) {
            let chunkSize = 0;
            for(let id = 0; id < archiveSize; id++) {
                const delta = buffer.get('INT');
                chunkSize += delta;

                chunkSizes[chunk][id] = chunkSize;
                sizes[id] += chunkSize;
            }
        }

        for(let id = 0; id < archiveSize; id++) {
            this.files.set(id, new FileData(id, null, new ByteBuffer(sizes[id])));
        }

        buffer.readerIndex = 0;

        for(let chunk = 0; chunk < chunkCount; chunk++) {
            for(let id = 0; id < archiveSize; id++) {
                const chunkSize = chunkSizes[chunk][id];
                this.files.get(id).content.putBytes(buffer.getSlice(buffer.readerIndex, chunkSize));
                buffer.copy(this.files.get(id).content, 0, buffer.readerIndex, buffer.readerIndex + chunkSize);
                buffer.readerIndex = (buffer.readerIndex + chunkSize);
            }
        }
    }

    private decompress(buffer: ByteBuffer, keys?: number[]): { compression: number, buffer: ByteBuffer, version: number } {
        const compression = buffer.get('BYTE', 'UNSIGNED');
        const length = buffer.get('INT');

        if(compression == 0) {
            const data = new ByteBuffer(length);
            buffer.copy(data, 0, buffer.readerIndex, length);
            const decryptedData = this.decryptXtea(data, keys, length);
            buffer.readerIndex = (buffer.readerIndex + length);

            let version = -1;
            if(buffer.readable >= 2) {
                version = buffer.get('SHORT');
            }

            return { compression, buffer: decryptedData, version };
        } else {
            const uncompressedLength = buffer.get('INT');

            const compressed = new ByteBuffer(length);
            buffer.copy(compressed, 0, buffer.readerIndex, buffer.readerIndex + length);
            const decryptedData = this.decryptXtea(compressed, keys, length);
            buffer.readerIndex = (buffer.readerIndex + length);

            let decompressed: ByteBuffer;
            if(compression == 1) { // BZIP2
                decompressed = this.decompressBzip(decryptedData);
            } else if(compression == 2) { // GZIP
                decompressed = new ByteBuffer(gunzipSync(decryptedData));
            } else {
                throw new Error(`Invalid compression type`);
            }

            if(decompressed.length != uncompressedLength) {
                throw new Error(`Length mismatch`);
            }

            let version = -1;
            if(buffer.readable >= 2) {
                version = buffer.get('SHORT');
            }

            return { compression, buffer: decompressed, version };
        }
    }

    private decryptXtea(input: ByteBuffer, keys: number[], length: number): ByteBuffer {
        if(!keys || keys.length === 0) {
            return input;
        }

        const output = new ByteBuffer(length);
        const numBlocks = Math.floor(length / 8);

        for(let block = 0; block < numBlocks; block++) {
            let v0 = input.get('INT');
            let v1 = input.get('INT');
            let sum = 0x9E3779B9 * 32;

            for(let i = 0; i < 32; i++) {
                v1 -= (((v0 << 4) ^ (v0 >>> 5)) + v0) ^ (sum + keys[(sum >>> 11) & 3]);
                sum -= 0x9E3779B9;
                v0 -= (((v1 << 4) ^ (v1 >>> 5)) + v1) ^ (sum + keys[sum & 3]);
            }

            output.put(v0, 'INT');
            output.put(v1, 'INT');
        }

        input.copy(output, output.writerIndex, input.readerIndex);

        return output;
    }

    private decompressBzip(data: ByteBuffer): ByteBuffer {
        const buffer = Buffer.alloc(data.length + 4);
        data.copy(buffer, 4);
        buffer[0] = 'B'.charCodeAt(0);
        buffer[1] = 'Z'.charCodeAt(0);
        buffer[2] = 'h'.charCodeAt(0);
        buffer[3] = '1'.charCodeAt(0);

        return new ByteBuffer(seekBzip.decode(buffer));
    }

}
