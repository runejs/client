import { CacheChannel, loadCacheChannels } from '@client/cache/fs/channels';
import { ArchiveIndex } from '@client/cache/archive-index';


export class AssetCache {

    public readonly dir: string;
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
        } else {
            return this.indexes.get(indexId);
        }
    }

}
