import { CacheChannel, loadCacheChannels } from './fs/channels';
import { ArchiveIndex } from './archive-index';
import { SpriteStore } from './stores/sprite-store';
import { getFileNames } from './util/name-hash';


export const fileNames = getFileNames('cache'); // @TODO configurable

export const getFileName = (nameHash: number): string | null => {
    return fileNames[nameHash.toString()] || nameHash.toString();
};


export class FileStore {

    public readonly dir: string;
    public readonly spriteStore = new SpriteStore(this);
    private readonly channels: CacheChannel;
    private readonly indexes = new Map<number, ArchiveIndex>();

    public constructor(dir: string) {
        this.dir = dir;
        this.channels = loadCacheChannels(dir);
    }

    public getIndex(indexId: number): ArchiveIndex {
        if(!this.indexes.has(indexId)) {
            const archiveIndex = new ArchiveIndex(indexId, this.channels);
            archiveIndex.decodeIndex();
            this.indexes.set(indexId, archiveIndex);
            return archiveIndex;
        } else {
            return this.indexes.get(indexId);
        }
    }

    public getSpriteIndex(): ArchiveIndex {
        return this.getIndex(5);
    }

    public getBinaryIndex(): ArchiveIndex {
        return this.getIndex(10);
    }

}
