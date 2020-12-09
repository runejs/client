import { readFileSync } from 'fs';
import { join } from 'path';

const parser = require('node-properties-parser');


export function hash(s: string): number {
    let hash = 0;
    for(let i = 0; i < s.length; i++) {
        hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

export function getFileNames(dir: string) {
    return parser.parse(readFileSync(join(dir, 'file-names.properties')));
}
