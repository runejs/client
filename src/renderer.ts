import { drawFlames } from './runes';
import { ipcRenderer } from 'electron';

ipcRenderer.on('synchronous-message', (event, args) => {
    if(args.type === 'runes') {
        drawFlames(args.runes, args.titlePixels);
    }
});
