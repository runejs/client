import { CacheChannel, loadCacheChannels } from './fs/channels';
import { ArchiveIndex } from './archive-index';
import { SpritePack } from './files/sprite-pack';
import { getFileNames } from './util/name-hash';


export class FileStore {

    public readonly dir: string;
    private readonly channels: CacheChannel;
    private readonly indexes = new Map<number, ArchiveIndex>();
    private readonly fileNames: { [key: string]: string };

    public constructor(dir: string) {
        this.dir = dir;
        this.channels = loadCacheChannels(dir);
        this.fileNames = getFileNames(dir);
    }

    public getFileName(nameHash: number): string | null {
        return this.fileNames[nameHash.toString()] || nameHash.toString();
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

    public decodeSpritePacks(): SpritePack[] {
        const spritePackIndex = this.getIndex(8);
        const packCount = spritePackIndex.archives.size;
        const spritePacks: SpritePack[] = [];

        for(let spritePackId = 0; spritePackId < packCount; spritePackId++) {
            const archive = spritePackIndex.getArchive(spritePackId, false);
            if(!archive) {
                console.log(`No archive found for sprite pack ${spritePackId}`);
                continue;
            }

            const spritePack = new SpritePack(archive.nameHash, archive.content, spritePackId);
            spritePack.decode();
            spritePacks.push(spritePack);
        }

        return spritePacks;
    }

}
