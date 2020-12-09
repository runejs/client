import { CacheChannel, loadCacheChannels } from './fs/channels';
import { ArchiveIndex } from './archive-index';
import { SpritePack } from './files/sprite-pack';


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

    public decodeSpritePacks(): SpritePack[] {
        const spritePackIndex = this.getIndex(8);
        const packCount = spritePackIndex.archives.size;
        const spritePacks: SpritePack[] = [];

        for(let spritePackId = 0; spritePackId < packCount; spritePackId++) {
            const archive = spritePackIndex.getArchive(spritePackId);
            const spritePack = new SpritePack(archive.content, spritePackId);
            spritePack.decode();
            spritePacks.push(spritePack);
        }

        return spritePacks;
    }

}
